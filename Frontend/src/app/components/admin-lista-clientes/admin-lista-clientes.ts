import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MiembroSeleccionado { //es una interfaz que define la estructura de un objeto que representa a un miembro seleccionado, con propiedades para el nombre y el ID del miembro en esa pantalla
  nombre: string;
  id: string;
}

@Component({
  selector: 'app-admin-lista-clientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-lista-clientes.html',
  styleUrl: './admin-lista-clientes.css'
})
export class AdminListaClientes {
  qrModalAbierto = signal(false); //es una señal que indica si el modal de código QR está abierto o cerrado. Inicialmente, está cerrado (false).
  miembroSeleccionado = signal<MiembroSeleccionado | null>(null); //es una señal que almacena la información del miembro seleccionado. Inicialmente, no hay ningún miembro seleccionado (null).

  verQr(nombre: string, id: string) { //es un método que se llama cuando se desea ver el código QR de un miembro específico. Toma el nombre y el ID del miembro como parámetros.
    this.miembroSeleccionado.set({ nombre, id }); //actualiza la señal miembroSeleccionado con un objeto que contiene el nombre y el ID del miembro seleccionado.
    this.qrModalAbierto.set(true); //abre el modal de código QR estableciendo la señal qrModalAbierto en true.
  }

  cerrarQr() {
    this.qrModalAbierto.set(false);
  }
}
