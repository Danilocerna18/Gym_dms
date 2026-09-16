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

  // TODO: quitar este botón cuando exista login real
  // Botón temporal solo para que el profesor revise el avance del frontend de admin (Sprint 2)
  verDemoAdmin(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}