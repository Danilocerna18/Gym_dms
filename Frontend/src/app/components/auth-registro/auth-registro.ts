
import { ChangeDetectorRef, Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { finalize } from "rxjs";

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

  constructor(
    private registroService: RegistroService,
    private detector: ChangeDetectorRef
  ) {}

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

    const datos = {
      name: this.nombre.trim(),
      email: this.email.trim().toLowerCase(),
      password: this.password,
    };

    this.detector.markForCheck();

    this.registroService
      .registrarUsuario(datos)
      .pipe(
        finalize(() => {
          this.registrando = false;

          console.log("FINALIZE EJECUTADO");

          this.detector.markForCheck();
        })
      )
      .subscribe({
        next: (respuesta) => {
          console.log("REGISTRO EXITOSO:", respuesta);

          this.cuentaCreada = true;
          this.mensajeExito =
            respuesta.message || "Tu cuenta fue creada correctamente.";

          this.detector.markForCheck();
        },

        error: (error: HttpErrorResponse) => {
          console.error("ERROR AL REGISTRAR:", error);

          this.mensajeError =
            error.error?.message ||
            "No se pudo crear la cuenta. Inténtalo nuevamente.";

          this.detector.markForCheck();
        },
      });
  }

  registrarseConGoogle(): void {
    window.location.href = "http://localhost:3000/api/auth/google";
  }

  regresar(): void {
    window.history.back();
  }
}