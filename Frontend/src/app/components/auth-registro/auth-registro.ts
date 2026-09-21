import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-registro',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './auth-registro.html',
  styleUrl: './auth-registro.css'
})
export class AuthRegistroComponent {

  nombre: string = '';
  email: string = '';
  telefono: string = '';
  password: string = '';

  plan: string = 'mensual';

  mostrarPassword: boolean = false;
  cuentaCreada: boolean = false;

  seleccionarPlan(plan: string): void {
    this.plan = plan;
  }

  crearCuenta(): void {
    this.cuentaCreada = true;

    console.log('Nombre:', this.nombre);
    console.log('Email:', this.email);
    console.log('Teléfono:', this.telefono);
    console.log('Contraseña:', this.password);
    console.log('Plan:', this.plan);
  }

  regresar(): void {
    window.history.back();
  }
}