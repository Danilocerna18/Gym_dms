import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type EstadoAforo = 'optimo' | 'concurrido' | 'lleno';

// respuesta de GET /api/aforo: solo números, nunca quién está adentro
export interface RespuestaAforo {
  personasAdentro: number;
  capacidad: number;
  porcentaje: number;
  estado: EstadoAforo;
}

@Injectable({
  providedIn: 'root',
})
export class Aforo {
  private http = inject(HttpClient);

  obtener(): Observable<RespuestaAforo> { // ocupación actual calculada desde AccessLog en el backend
    // withCredentials para que la cookie de sesión viaje entre localhost:4200 y localhost:3000
    return this.http.get<RespuestaAforo>(`${environment.apiUrl}/api/aforo`, { withCredentials: true });
  }
}
