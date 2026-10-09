
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";

import { RegistroService } from "../../services/registro.service";

@Component({
  selector: "app-auth-registro",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./auth-registro.html",
  styleUrl: "./auth-registro.css",
})
export class AuthRegistroComponent {
  nombre: string = "";
  email: string = "";
  telefono: string = "";
  password: string = "";

  plan: string = "mensual";

  mostrarPassword: boolean = false;
  cuentaCreada: boolean = false;
  registrando: boolean = false;

  mensajeError: string = "";
  mensajeExito: string = "";

  constructor(private registroService: RegistroService) {}

  seleccionarPlan(plan: string): void {
    this.plan = plan;
  }


  crearCuenta(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
    this.cuentaCreada = false;
    this.registrando = true;

    const datos = {
      name: this.nombre.trim(),
      email: this.email.trim().toLowerCase(),
      password: this.password
    };

    console.log('Enviando registro:', datos.email);

    this.registroService.registrarUsuario(datos).subscribe({
      next: (respuesta) => {
        console.log('Respuesta del servidor:', respuesta);

        this.registrando = false;
        this.cuentaCreada = true;
        this.mensajeExito =
          respuesta.message || 'Tu cuenta fue creada correctamente.';
      },
      error: (error) => {
        console.error('Error al registrar:', error);

        this.registrando = false;
        this.mensajeError =
          error.error?.message || 'No se pudo crear la cuenta.';
      },
      complete: () => {
        console.log('Solicitud de registro finalizada.');
      }
    });
  }

  registrarseConGoogle(): void {
    window.location.href =
      "http://localhost:3000/api/auth/google";
  }

  regresar(): void {
    window.history.back();
  }
}