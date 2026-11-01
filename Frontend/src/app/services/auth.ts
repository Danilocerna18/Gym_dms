import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

export type Role = 'member' | 'admin';
interface Account { id: string; name: string; email: string; role: Role }
interface Membership {
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  startDate: string | null; // null mientras está pendiente: las fechas se calculan al activar
  endDate: string | null;
  plan: { name: string };
}
interface Profile extends Account { qrCode: string; memberships: Membership[] }

export function homeFor(role: Role) {
  return role === 'admin' ? '/admin/dashboard' : '/user-home';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private api = environment.apiUrl + '/api';
  private options = { withCredentials: true };
  readonly profile = signal<Profile | null>(null);
  readonly initials = computed(() => this.profile()?.name.trim().split(/\s+/).slice(0, 2).map(n => n[0]).join(''));
  readonly membership = computed<Membership | undefined>(() => {
    const list = this.profile()?.memberships ?? [];
    const now = Date.now();
    return list.find(m => m.status === 'active' && m.startDate && m.endDate
      && Date.parse(m.startDate) <= now && Date.parse(m.endDate) >= now) ?? list[0];
  });
  readonly status = computed(() => {
    const m = this.membership();
    if (!m) return 'Sin membresía';
    if (m.status === 'pending') return 'Pendiente de activación';
    if (m.status === 'cancelled') return 'Cancelada';
    if (m.status === 'expired' || !m.endDate || Date.parse(m.endDate) < Date.now()) return 'Vencida';
    return m.startDate && Date.parse(m.startDate) > Date.now() ? 'Próxima' : 'Activa';
  });
  login(email: string, password: string) {
    return this.http.post<{user: Account}>(this.api + '/auth/login', { email, password }, this.options);
  }
  session() {
    return this.http.get<{user: Profile}>(this.api + '/users/me', this.options)
      .pipe(tap(({ user }) => this.profile.set(user)));
  }
  logout() {
    this.http.post(this.api + '/auth/logout', {}, this.options).subscribe({
      next: () => { this.profile.set(null); void this.router.navigateByUrl('/login', { replaceUrl: true }); },
      error: () => window.alert('No se pudo cerrar la sesión. Intenta nuevamente.')
    });
  }
}
