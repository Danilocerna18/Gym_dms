import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MachineService, Machine } from '../../services/machine.service';
import { AdminMenuPerfil } from '../admin-menu-perfil/admin-menu-perfil';

@Component({
  selector: 'app-admin-lista-maquinas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    AdminMenuPerfil
  ],
  templateUrl: './admin-lista-maquinas.html',
  styleUrl: './admin-lista-maquinas.css'
})
export class AdminListaMaquinasComponent implements OnInit {
  private machineService = inject(MachineService);
  private router = inject(Router);

  maquinas = signal<Machine[]>([]);
  cargando = signal(true);
  errorMensaje = signal('');

  busqueda = signal('');
  filtroGrupo = signal('todas');

  maquinasFiltradas = computed(() => {
    const query = this.busqueda().toLowerCase().trim();
    const grupo = this.filtroGrupo();

    return this.maquinas().filter(m => {
      const coincideNombre = m.name?.toLowerCase().includes(query) || 
                             m.id?.toLowerCase().includes(query) || 
                             m.qrCode?.toLowerCase().includes(query);
      const coincideGrupo = grupo === 'todas' || (m.group && m.group.toLowerCase() === grupo.toLowerCase());
      return coincideNombre && coincideGrupo;
    });
  });

  gruposUnicos = computed(() => {
    const grupos = this.maquinas()
      .map(m => m.group)
      .filter((g): g is string => !!g);
    return Array.from(new Set(grupos));
  });

  ngOnInit() {
    this.cargarMaquinas();
  }

  cargarMaquinas() {
    this.cargando.set(true);
    this.errorMensaje.set('');

    this.machineService.getMachines().subscribe({
      next: (res: any) => {
        const lista = Array.isArray(res) ? res : (res?.machines || []);
        this.maquinas.set(lista);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar máquinas:', err);
        this.errorMensaje.set('No se pudieron cargar las máquinas.');
        this.cargando.set(false);
      }
    });
  }

  eliminarMaquina(id: string, nombre: string) {
    if (!confirm(`¿Estás seguro de eliminar la máquina "${nombre}"?`)) return;

    this.machineService.deleteMachine(id).subscribe({
      next: () => {
        this.maquinas.update(lista => lista.filter(m => m.id !== id));
      },
      error: (err) => {
        console.error('Error al eliminar la máquina:', err);
        alert('No se pudo eliminar la máquina.');
      }
    });
  }

  nuevaMaquina() {
    this.router.navigate(['/admin-formulario-maquina']);
  }

  seleccionarFiltro(filtro: string) {
    this.filtroGrupo.set(filtro);
  }
}