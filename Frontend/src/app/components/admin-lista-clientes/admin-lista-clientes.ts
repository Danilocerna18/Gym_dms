import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Clientes, Cliente, ResumenClientes } from '../../services/clientes';

interface MiembroSeleccionado { //es una interfaz que define la estructura de un objeto que representa a un miembro seleccionado, con propiedades para el nombre y el código QR del miembro en esa pantalla
  nombre: string;
  qrCode: string;
}

const MENSAJE_SIN_CONEXION = 'Sin conexión. Intenta de nuevo.';

@Component({
  selector: 'app-admin-lista-clientes',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-lista-clientes.html',
  styleUrl: './admin-lista-clientes.css'
})
export class AdminListaClientes implements OnInit {
  private clientesService = inject(Clientes);

  cargando = signal(true); // mientras llega la respuesta del backend
  error = signal(''); // mensaje para el usuario si la carga falla, vacío si no hay error
  clientes = signal<Cliente[]>([]); // miembros que devuelve el backend
  busqueda = signal(''); // texto del buscador
  // La búsqueda opera sobre los miembros ya cargados (máximo LIMITE_CLIENTES del backend); al agregar paginación, moverla al backend con un parámetro q.
  clientesFiltrados = computed(() => { // lista que muestra la tabla: por nombre o correo, sin importar mayúsculas ni tildes
    const texto = this.normalizar(this.busqueda());
    if (!texto) return this.clientes();
    return this.clientes().filter(c => this.normalizar(c.name).includes(texto) || this.normalizar(c.email).includes(texto));
  });
  resumen = signal<ResumenClientes>({ miembrosActivos: 0, accesosHoy: 0, porVencer: 0 }); // números de las tarjetas

  qrModalAbierto = signal(false); //es una señal que indica si el modal de código QR está abierto o cerrado. Inicialmente, está cerrado (false).
  miembroSeleccionado = signal<MiembroSeleccionado | null>(null); //es una señal que almacena la información del miembro seleccionado. Inicialmente, no hay ningún miembro seleccionado (null).

  ngOnInit() {
    this.cargar();
  }

  cargar() { // nunca muestra el error técnico crudo, solo el mensaje de conexión
    this.cargando.set(true);
    this.error.set('');
    this.clientesService.listar().subscribe({
      next: respuesta => {
        this.clientes.set(respuesta.clientes);
        this.resumen.set(respuesta.resumen);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(MENSAJE_SIN_CONEXION);
        this.cargando.set(false);
      }
    });
  }

  buscar(input: HTMLInputElement) { // se llama en cada tecla del buscador
    this.busqueda.set(input.value);
  }

  private normalizar(texto: string): string { // minúsculas, sin tildes y sin espacios al inicio ni al final
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  verQr(nombre: string, qrCode: string) { //es un método que se llama cuando se desea ver el código QR de un miembro específico. Toma el nombre y el código QR del miembro como parámetros.
    this.miembroSeleccionado.set({ nombre, qrCode }); //actualiza la señal miembroSeleccionado con un objeto que contiene el nombre y el código QR del miembro seleccionado.
    this.qrModalAbierto.set(true); //abre el modal de código QR estableciendo la señal qrModalAbierto en true.
  }

  cerrarQr() {
    this.qrModalAbierto.set(false);
  }

  iniciales(nombre: string): string { // dos letras para el avatar
    const partes = nombre.trim().split(/\s+/);
    return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
  }

  formatearFecha(iso: string): string { // "Hoy, 07:15 AM", "Ayer, 06:30 PM" o "09 oct, 07:15 AM", en hora local del navegador
    const fecha = new Date(iso);
    const hoy = new Date();
    const ayer = new Date();
    ayer.setDate(hoy.getDate() - 1);

    const hora = fecha.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const mismoDia = (a: Date, b: Date) => a.toDateString() === b.toDateString();

    if (mismoDia(fecha, hoy)) return `Hoy, ${hora}`;
    if (mismoDia(fecha, ayer)) return `Ayer, ${hora}`;
    return `${fecha.toLocaleDateString('es', { day: '2-digit', month: 'short' }).replace('.', '')}, ${hora}`;
  }
}
