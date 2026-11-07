import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Clientes, Cliente, EstadoCliente, ResumenClientes } from '../../services/clientes';
import { Membresias } from '../../services/membresias';
import { AdminMenuPerfil } from '../admin-menu-perfil/admin-menu-perfil';

interface MiembroSeleccionado { //es una interfaz que define la estructura de un objeto que representa a un miembro seleccionado, con propiedades para el nombre y el código QR del miembro en esa pantalla
  nombre: string;
  qrCode: string;
}

const MENSAJE_SIN_CONEXION = 'Sin conexión. Intenta de nuevo.';

@Component({
  selector: 'app-admin-lista-clientes',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, AdminMenuPerfil],
  templateUrl: './admin-lista-clientes.html',
  styleUrl: './admin-lista-clientes.css'
})
export class AdminListaClientes implements OnInit {
  private clientesService = inject(Clientes);
  private membresias = inject(Membresias);

  cargando = signal(true); // mientras llega la respuesta del backend
  error = signal(''); // mensaje para el usuario si la carga falla, vacío si no hay error
  clientes = signal<Cliente[]>([]); // miembros que devuelve el backend
  busqueda = signal(''); // texto del buscador
  filtroEstado = signal<EstadoCliente | 'todos'>('todos'); // selector de estado junto al buscador
  // La búsqueda opera sobre los miembros ya cargados (máximo LIMITE_CLIENTES del backend); al agregar paginación, moverla al backend con un parámetro q.
  clientesFiltrados = computed(() => { // lista que muestra la tabla: por nombre o correo, sin importar mayúsculas ni tildes
    const texto = this.normalizar(this.busqueda());
    const estado = this.filtroEstado();
    return this.clientes().filter(c =>
      (estado === 'todos' || c.estado === estado) &&
      (!texto || this.normalizar(c.name).includes(texto) || this.normalizar(c.email).includes(texto)));
  });
  resumen = signal<ResumenClientes>({ miembrosActivos: 0, accesosHoy: 0, porVencer: 0 }); // números de las tarjetas

  clientePorActivar = signal<Cliente | null>(null); // abre el modal "¿Confirmas que ... pagó su plan?"
  activando = signal(false); // evita mandar el PATCH dos veces
  avisoActivacion = signal(''); // resultado de la última activación, vacío si no hay nada que mostrar
  avisoEsError = signal(false);

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

  filtrarEstado(valor: string) {
    this.filtroEstado.set(valor as EstadoCliente | 'todos');
  }

  pedirActivacion(cliente: Cliente) { // primero confirma que el miembro pagó en recepción
    this.avisoActivacion.set('');
    this.clientePorActivar.set(cliente);
  }

  cancelarActivacion() {
    if (!this.activando()) this.clientePorActivar.set(null);
  }

  confirmarActivacion() { // activa y actualiza solo esa fila, sin recargar la lista
    const cliente = this.clientePorActivar();
    if (!cliente?.membresiaPendienteId || this.activando()) return;

    this.activando.set(true);
    this.membresias.activar(cliente.membresiaPendienteId).subscribe({
      next: ({ membership }) => {
        this.clientes.update(lista => lista.map(c => c.id === cliente.id
          ? { ...c, estado: 'activo', membresiaPendienteId: null, fechaVencimiento: membership.endDate }
          : c));
        this.resumen.update(r => ({ ...r, miembrosActivos: r.miembrosActivos + 1 }));
        this.mostrarAviso(`Membresía de ${cliente.name} activada.`, false);
        this.terminarActivacion();
      },
      error: (err: unknown) => {
        // 409 = ya no estaba pendiente (otro admin la activó); el backend manda un mensaje para el usuario
        if (err instanceof HttpErrorResponse && err.status === 409 && err.error?.message) {
          this.mostrarAviso(err.error.message, true);
          this.cargar(); // la lista se pone al día con lo que hay en la base
        } else {
          this.mostrarAviso(MENSAJE_SIN_CONEXION, true);
        }
        this.terminarActivacion();
      }
    });
  }

  private terminarActivacion() {
    this.activando.set(false);
    this.clientePorActivar.set(null);
  }

  private mostrarAviso(mensaje: string, esError: boolean) {
    this.avisoActivacion.set(mensaje);
    this.avisoEsError.set(esError);
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
