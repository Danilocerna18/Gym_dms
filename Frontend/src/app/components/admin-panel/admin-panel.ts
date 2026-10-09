import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Panel, AlertaPanel, ResumenPanel } from '../../services/panel';

const MENSAJE_SIN_CONEXION = 'Sin conexión. Intenta de nuevo.';

@Component({
  selector: 'app-admin-panel',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css',
})
export class AdminPanel implements OnInit {
  private panel = inject(Panel);

  cargando = signal(true); // mientras llega la respuesta del backend
  error = signal(''); // mensaje para el usuario si la carga falla, vacío si no hay error
  resumen = signal<ResumenPanel>({ totalMiembros: 0, nuevosEsteMes: 0, activosHoy: 0 }); // números de las tarjetas
  alertas = signal<AlertaPanel[]>([]); // alertas recientes que devuelve el backend

  ngOnInit() {
    this.cargar();
  }

  cargar() { // nunca muestra el error técnico crudo, solo el mensaje de conexión
    this.cargando.set(true);
    this.error.set('');
    this.panel.obtener().subscribe({
      next: respuesta => {
        this.resumen.set(respuesta.resumen);
        this.alertas.set(respuesta.alertas);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(MENSAJE_SIN_CONEXION);
        this.cargando.set(false);
      }
    });
  }
}
