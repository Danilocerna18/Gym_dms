
import { ChangeDetectorRef, Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { finalize } from "rxjs";

import { RegistroService, PlanRegistro } from "../../services/registro.service";
import { environment } from "../../../environments/environment";

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
  plan: PlanRegistro = "mensual";

  mostrarPassword: boolean = false;
  cuentaCreada: boolean = false;
  registrando: boolean = false;

  mensajeError: string = "";
  mensajeExito: string = "";

  constructor(
    private registroService: RegistroService,
    private detector: ChangeDetectorRef
  ) {}

  seleccionarPlan(plan: PlanRegistro): void {
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
      plan: this.plan,
    };

    this.detector.markForCheck();

    this.registroService
      .registrarUsuario(datos)
      .pipe(
        finalize(() => {
          this.registrando = false;

          this.detector.markForCheck();
        })
      )
      .subscribe({
        next: (respuesta) => {
          if (respuesta?.ok !== true || !respuesta.user?.id) {
            this.mensajeError = "El servidor no confirmó la creación de la cuenta.";
            return;
          }
          this.password = "";

          this.cuentaCreada = true;
          this.mensajeExito =
            respuesta.message || "Tu cuenta fue creada correctamente.";

          this.detector.markForCheck();
        },

        error: (error: HttpErrorResponse) => {
          this.mensajeError =
            error.error?.message ||
            (error.status === 0
              ? "No se pudo contactar con GymSync. Comprueba que el backend esté en ejecución."
              : "No se pudo crear la cuenta. Inténtalo nuevamente.");

          this.detector.markForCheck();
        },
      });
  }

  registrarseConGoogle(): void {
    window.location.href = `${environment.apiUrl}/api/auth/google`;
  }

  regresar(): void {
    window.history.back();
  }
}