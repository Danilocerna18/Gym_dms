import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-lista-maquinas',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-lista-maquinas.html',
  styleUrl: './admin-lista-maquinas.css'
})
export class AdminListaMaquinasComponent {

  busqueda: string = '';
  filtroActual: string = 'todas';

  seleccionarFiltro(filtro: string): void {
    this.filtroActual = filtro;
  }

  nuevaMaquina(): void {
    console.log('Nueva máquina');
  }

  exportarQR(): void {
    console.log('Exportando etiquetas QR');
  }

  regresar(): void {
    window.history.back();
  }
}