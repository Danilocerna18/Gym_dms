
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
    if (this.registrando || this.cuentaCreada) {
      return;
    }

    this.mensajeError = "";
    this.mensajeExito = "";

    this.registrando = true;

    // Enviamos los nombres de campos que espera el backend.
    this.registroService.registrarUsuario({
      name: this.nombre.trim(),
      email: this.email.trim(),
      password: this.password,
    }).subscribe({
      next: (respuesta) => {
        this.cuentaCreada = true;
        this.registrando = false;
        this.mensajeExito = respuesta.message;
      },

      error: (error: HttpErrorResponse) => {
        this.registrando = false;

        if (error.error?.message) {
          this.mensajeError = error.error.message;
        } else {
          this.mensajeError =
            "No se pudo conectar con el servidor. Comprueba que el backend esté funcionando.";
        }
      },
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