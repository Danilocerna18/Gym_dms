import { environment } from '../../../environments/environment';
import { AuthService, homeFor } from '../../services/auth';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-iniciar-sesion',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './auth-iniciar-sesion.html',
  styleUrl: './auth-iniciar-sesion.css'
})
export class AuthIniciarSesionComponent {

  private router = inject(Router);

  email: string = '';
  password: string = '';
  mostrarPassword: boolean = false;

  regresar(): void {
    window.history.back();
  }

  private auth = inject(AuthService);
  cargando = signal(false);
  error = signal('');

  iniciarSesion(): void {
    if (this.cargando()) return;
    this.cargando.set(true);
    this.error.set('');
    this.auth.login(this.email, this.password).subscribe({
      next: ({ user }) => {
        this.password = '';
        this.cargando.set(false);
        void this.router.navigateByUrl(homeFor(user.role));
      },
      error: err => {
        this.cargando.set(false);
        this.error.set(err.error?.message ?? 'No se pudo conectar con GymSync. Intenta nuevamente.');
      }
    });
  }

  readonly googleUrl = environment.apiUrl + '/api/auth/google';
}
