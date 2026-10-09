import { finalize } from 'rxjs';
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

    this.registroService.registrarUsuario(datos)
      .pipe(
        finalize(() => {
          console.log('FINALIZE EJECUTADO');
          this.registrando = false;
        })
      )
      .subscribe({
        next: (respuesta) => {
          console.log('ENTRÓ AL NEXT:', respuesta);

          this.cuentaCreada = true;
          this.mensajeExito = respuesta.message;
        },
        error: (error) => {
          console.error('ENTRÓ AL ERROR:', error);

          this.mensajeError =
            error.error?.message || 'No se pudo crear la cuenta.';
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