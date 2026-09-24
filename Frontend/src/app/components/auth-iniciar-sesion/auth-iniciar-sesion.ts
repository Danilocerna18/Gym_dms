import { Component, inject } from '@angular/core';
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

  iniciarSesion(): void {
    console.log('Email:', this.email);
    console.log('Contraseña:', this.password);

    this.router.navigate(['/user-home']);
  }

  // login con Google
  loginWithGoogle(): void {
    window.location.href = 'http://localhost:3000/api/auth/google';
  }

  // TODO: quitar este botón cuando exista login real
  verDemoAdmin(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
