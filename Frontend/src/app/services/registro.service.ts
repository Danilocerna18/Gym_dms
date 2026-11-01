
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";

export type PlanRegistro = "mensual" | "anual";

export interface DatosRegistro {
  name: string;
  email: string;
  password: string;
  plan: PlanRegistro;
}

export interface RespuestaRegistro {
  ok: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    qrCode: string;
    createdAt: string;
  };
}

@Injectable({
  providedIn: "root",
})
export class RegistroService {
  private apiUrl = environment.apiUrl + "/api/auth";

  constructor(private http: HttpClient) {}

  registrarUsuario(
    datos: DatosRegistro
  ): Observable<RespuestaRegistro> {
    return this.http.post<RespuestaRegistro>(
      `${this.apiUrl}/register`,
      datos
    );
  }
}