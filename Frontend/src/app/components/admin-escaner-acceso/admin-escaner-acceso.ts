import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

type ResultadoEscaneo = 'concedido' | 'denegado';

@Component({
  selector: 'app-admin-escaner-acceso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-escaner-acceso.html',
  styleUrl: './admin-escaner-acceso.css'
})
export class AdminEscanerAcceso {
  resultadoVisible = signal(false);
  resultadoTipo = signal<ResultadoEscaneo>('concedido');

  simularEscaneo(tipo: ResultadoEscaneo = 'concedido') {
    if (this.resultadoVisible()) return; // evita disparar otro mientras uno ya se muestra

    this.resultadoTipo.set(tipo);
    this.resultadoVisible.set(true);

    setTimeout(() => {
      this.resultadoVisible.set(false);
    }, 2500);
  }

  ingresoManual() {
    // TODO: abrir flujo de búsqueda manual de miembro cuando se conecte al backend
    console.log('Ingreso manual solicitado');
  }
}