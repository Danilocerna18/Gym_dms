import { Component, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MachineService, Machine } from '../../services/machine.service';

export interface MuscleCategory {
  title: string;
  machines: Machine[];
}

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-home.html',
  styleUrl: './user-home.css'
})
export class UserHomeComponent implements OnInit {

  auth = {
    initials: () => 'US',
    profile: () => ({ name: 'Usuario Gym' }),
    membership: () => ({
      plan: { name: 'Mensual VIP' },
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    })
  };

  estadoMembresia = signal<string>('pendiente');
  maquinas: Machine[] = [];
  muscleCategories: MuscleCategory[] = [];
  cargando: boolean = true;

  constructor(
    private machineService: MachineService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarMaquinas();
  }

  cargarMaquinas(): void {
    this.cargando = true;
    this.machineService.getMachines().subscribe({
      next: (data) => {
        this.maquinas = Array.isArray(data) ? data : (data as any).machines || [];
        this.organizarCategorias();
        this.cargando = false;
        this.cdr.detectChanges(); // Forzar renderizado inmediato
      },
      error: (err) => {
        console.error('Error al obtener catálogo de máquinas:', err);
        this.organizarCategorias();
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  organizarCategorias(): void {
    const gruposMap = new Map<string, Machine[]>();

    this.maquinas.forEach((m) => {
      const g = (m.group || 'GENERAL').toUpperCase();
      if (!gruposMap.has(g)) {
        gruposMap.set(g, []);
      }
      gruposMap.get(g)!.push(m);
    });

    this.muscleCategories = Array.from(gruposMap.entries()).map(([title, machines]) => ({
      title,
      machines
    }));
  }

  openMachineDetail(machine: Machine): void {
    this.router.navigate(['/user-maquinadet'], {
      state: { machineData: machine }
    });
  }
}