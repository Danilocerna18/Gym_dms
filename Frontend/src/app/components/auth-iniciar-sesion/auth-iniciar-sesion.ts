import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-iniciar-sesion',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './auth-iniciar-sesion.html',
  styleUrl: './auth-iniciar-sesion.css'
})
export class AuthIniciarSesionComponent {

  email: string = '';
  password: string = '';
  mostrarPassword: boolean = false;

  regresar(): void {
    window.history.back();
  }

  iniciarSesion(): void {
    console.log('Email:', this.email);
    console.log('Contraseña:', this.password);
  }
}