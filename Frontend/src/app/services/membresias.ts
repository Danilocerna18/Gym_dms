import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type EstadoMembresia = 'pending' | 'active' | 'expired' | 'cancelled';

// plan activo de GET /api/plans (price llega como número, no como texto)
export interface Plan {
  id: string;
  name: string;
  durationDays: number;
  price: number;
}

// membresía más reciente del miembro, de GET /api/memberships/me
// startDate y endDate son null mientras está pendiente: se calculan al activar
export interface MiMembresia {
  id: string;
  status: EstadoMembresia;
  startDate: string | null; // ISO
  endDate: string | null; // ISO
  plan: { name: string; price: number };
}

// una membresía del historial, de GET /api/memberships/me/history
// el backend ya reporta como "expired" una active cuya endDate pasó
export interface MembresiaHistorial {
  id: string;
  status: EstadoMembresia;
  plan: { name: string; price: number };
  createdAt: string; // ISO, cuándo escogió el plan
  activatedAt: string | null; // ISO, null si nunca se activó
  startDate: string | null;
  endDate: string | null;
}

// membresía tal como la devuelven POST /api/memberships y el PATCH de activar (sin el plan incluido)
export interface MembresiaCreada {
  id: string;
  planId: string;
  status: EstadoMembresia;
  startDate: string | null;
  endDate: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class Membresias {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/api`;
  // withCredentials para que la cookie de sesión viaje entre localhost:4200 y localhost:3000
  private opciones = { withCredentials: true };

  planes(): Observable<{ plans: Plan[] }> { // planes activos, no requiere sesión
    return this.http.get<{ plans: Plan[] }>(`${this.api}/plans`, this.opciones);
  }

  miMembresia(): Observable<{ membership: MiMembresia | null }> { // null si todavía no escogió plan
    return this.http.get<{ membership: MiMembresia | null }>(`${this.api}/memberships/me`, this.opciones);
  }

  historial(): Observable<{ memberships: MembresiaHistorial[] }> { // todas las membresías del miembro, la más reciente primero
    return this.http.get<{ memberships: MembresiaHistorial[] }>(`${this.api}/memberships/me/history`, this.opciones);
  }

  escogerPlan(planId: string): Observable<{ membership: MembresiaCreada; message: string }> { // crea la membresía pending; 409 si ya tiene una active o pending
    return this.http.post<{ membership: MembresiaCreada; message: string }>(`${this.api}/memberships`, { planId }, this.opciones);
  }

  activar(membershipId: string): Observable<{ membership: MembresiaCreada; message: string }> { // solo admin; 409 si ya no está pending
    return this.http.patch<{ membership: MembresiaCreada; message: string }>(`${this.api}/admin/memberships/${membershipId}/activate`, {}, this.opciones);
  }
}
