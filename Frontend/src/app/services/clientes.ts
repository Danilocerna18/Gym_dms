import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type EstadoCliente = 'activo' | 'por_vencer' | 'vencido';

export interface Cliente {
  id: string;
  name: string;
  email: string;
  qrCode: string;
  estado: EstadoCliente;
  fechaVencimiento: string | null; // ISO
  ultimaEntrada: string | null; // ISO
  ultimaSalida: string | null; // ISO
}

export interface ResumenClientes {
  miembrosActivos: number;
  accesosHoy: number;
  porVencer: number;
}

// respuesta de GET /api/clientes
export interface RespuestaClientes {
  resumen: ResumenClientes;
  clientes: Cliente[];
}

@Injectable({
  providedIn: 'root',
})
export class Clientes {
  private http = inject(HttpClient);

  listar(): Observable<RespuestaClientes> { // lista los miembros con su estado y último acceso
    // withCredentials para que la cookie de sesión viaje entre localhost:4200 y localhost:3000
    return this.http.get<RespuestaClientes>(`${environment.apiUrl}/api/clientes`, { withCredentials: true });
  }
}
