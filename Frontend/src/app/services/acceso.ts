import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// respuesta de POST /api/scan: el backend decide si el código es de un miembro o de una máquina
export type RespuestaEscaneo =
  | { type: 'membership'; userId: string }
  | { type: 'machine'; machineId: string };

// respuesta de POST /api/access/validate (los rechazos llegan con HTTP 200 y granted: false)
export interface RespuestaValidacion {
  granted: boolean;
  result: 'granted' | 'denied_expired' | 'denied_duplicate';
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class Acceso {
  private http = inject(HttpClient);

  scan(qrCode: string): Observable<RespuestaEscaneo> { // identifica a qué pertenece el código escaneado
    // withCredentials para que la cookie de sesión viaje entre localhost:4200 y localhost:3000
    return this.http.post<RespuestaEscaneo>(`${environment.apiUrl}/api/scan`, { qrCode }, { withCredentials: true });
  }

  validateAccess(userId: string, scannedBy: string): Observable<RespuestaValidacion> { // valida la membresía y registra el intento en AccessLog
    return this.http.post<RespuestaValidacion>(`${environment.apiUrl}/api/access/validate`, { userId, scannedBy }, { withCredentials: true });
  }
}
