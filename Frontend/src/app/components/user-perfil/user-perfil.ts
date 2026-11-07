import { AuthService } from '../../services/auth';
import { EstadoMembresia, MembresiaHistorial, Membresias, MiMembresia, Plan } from '../../services/membresias';
import { inject, Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';

// qué bloque muestra la sección "Mi membresía"
type VistaMembresia = 'cargando' | 'error' | 'sin' | 'pendiente' | 'activa' | 'vencida';

const MENSAJE_SIN_CONEXION = 'Sin conexión. Intenta de nuevo.';
const MENSAJE_EN_PROCESO = 'Ya tienes una membresía en proceso.';

// Las fechas del historial se muestran en hora de Guatemala (UTC-6, sin horario de verano)
const ZONA_GUATEMALA = '-0600';

// etiqueta de cada estado en el historial; solo "Activa" va en track-green
const ETIQUETA_ESTADO: Record<EstadoMembresia, string> = {
  active: 'Activa',
  pending: 'Pendiente de activación',
  expired: 'Vencida',
  cancelled: 'Cancelada',
};

@Component({
  selector: 'app-user-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-perfil.html',
  styleUrl: './user-perfil.css'
})
export class UserPerfil implements OnInit {
  readonly auth = inject(AuthService);
  private membresias = inject(Membresias);

  readonly mensajeSinConexion = MENSAJE_SIN_CONEXION;

  cargando = signal(true);
  errorCarga = signal(false);
  membresia = signal<MiMembresia | null>(null); // la más reciente, de GET /api/memberships/me
  planes = signal<Plan[]>([]);
  planPorConfirmar = signal<Plan | null>(null); // abre el modal de confirmación
  enviando = signal(false); // evita mandar el plan dos veces con doble toque
  errorEnvio = signal(''); // mensaje si escoger el plan falla, vacío si no hay error

  readonly zonaGuatemala = ZONA_GUATEMALA;
  historialAbierto = signal(false); // modal "Historial de membresías"
  historialCargando = signal(false);
  historialError = signal(false);
  historial = signal<MembresiaHistorial[]>([]);

  vista = computed<VistaMembresia>(() => {
    if (this.cargando()) return 'cargando';
    if (this.errorCarga()) return 'error';
    const m = this.membresia();
    // cancelada se trata como sin membresía: puede escoger un plan nuevo
    if (!m || m.status === 'cancelled') return 'sin';
    if (m.status === 'pending') return 'pendiente';
    // todavía no existe el cron de vencimiento (PRD decisión 12): una membresía
    // con status "active" pero endDate pasada ya está vencida
    if (m.status === 'active' && m.endDate && Date.parse(m.endDate) >= Date.now()) return 'activa';
    return 'vencida';
  });

  ngOnInit() {
    this.cargar();
  }

  cargar() { // trae la membresía y los planes juntos; nunca muestra el error técnico crudo
    this.cargando.set(true);
    this.errorCarga.set(false);
    forkJoin([this.membresias.miMembresia(), this.membresias.planes()]).subscribe({
      next: ([{ membership }, { plans }]) => {
        this.membresia.set(membership);
        this.planes.set(plans);
        this.cargando.set(false);
      },
      error: () => {
        this.errorCarga.set(true);
        this.cargando.set(false);
      }
    });
  }

  escoger(plan: Plan) { // primero pide confirmación, no envía nada todavía
    this.errorEnvio.set('');
    this.planPorConfirmar.set(plan);
  }

  cancelarConfirmacion() {
    if (!this.enviando()) this.planPorConfirmar.set(null);
  }

  confirmar() { // crea la membresía pendiente y cambia la vista sin recargar
    const plan = this.planPorConfirmar();
    if (!plan || this.enviando()) return;

    this.enviando.set(true);
    this.membresias.escogerPlan(plan.id).subscribe({
      next: ({ membership }) => {
        // el POST no incluye el plan, se arma con el que ya tenemos en pantalla
        this.membresia.set({
          id: membership.id,
          status: membership.status,
          startDate: membership.startDate,
          endDate: membership.endDate,
          plan: { name: plan.name, price: plan.price },
        });
        this.enviando.set(false);
        this.planPorConfirmar.set(null);
        this.refrescarSesion();
      },
      error: (err: unknown) => {
        this.enviando.set(false);
        this.planPorConfirmar.set(null);
        if (err instanceof HttpErrorResponse && err.status === 409) {
          this.errorEnvio.set(MENSAJE_EN_PROCESO);
          this.cargar(); // muestra la membresía que el backend ya tiene
        } else {
          this.errorEnvio.set(MENSAJE_SIN_CONEXION);
        }
      }
    });
  }

  abrirHistorial() { // se pide cada vez que se abre, para que refleje activaciones recientes
    this.historialAbierto.set(true);
    this.cargarHistorial();
  }

  cerrarHistorial() {
    this.historialAbierto.set(false);
  }

  cargarHistorial() { // nunca muestra el error técnico crudo
    this.historialCargando.set(true);
    this.historialError.set(false);
    this.membresias.historial().subscribe({
      next: ({ memberships }) => {
        this.historial.set(memberships);
        this.historialCargando.set(false);
      },
      error: () => {
        this.historialError.set(true);
        this.historialCargando.set(false);
      }
    });
  }

  etiquetaEstado(status: EstadoMembresia): string {
    return ETIQUETA_ESTADO[status];
  }

  precio(plan: { price: number }): string { // "Q250", "Q2,400"
    return `Q${plan.price.toLocaleString('es-GT')}`;
  }

  duracion(plan: Plan): string {
    if (plan.durationDays === 30) return '30 días';
    if (plan.durationDays === 365) return '1 año (365 días)';
    return `${plan.durationDays} días`;
  }

  // El encabezado y el inicio leen auth.profile(); se refresca para que también
  // digan "Pendiente de activación" sin recargar la página.
  private refrescarSesion() {
    this.auth.session().subscribe({
      error: err => console.error('No se pudo refrescar el perfil después de escoger plan:', err)
    });
  }
}
