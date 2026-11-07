import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type TipoAlerta = 'fallido' | 'vencido' | 'por_caducar';

export interface AlertaPanel {
  tipo: TipoAlerta;
  miembro: { id: string; name: string };
  plan: string;
  detalle: string;
  fecha: string; // ISO
}

export interface ResumenPanel {
  totalMiembros: number;
  nuevosEsteMes: number;
  activosHoy: number;
}

// respuesta de GET /api/dashboard
export interface RespuestaPanel {
  resumen: ResumenPanel;
  alertas: AlertaPanel[];
}

@Injectable({
  providedIn: 'root',
})
export class Panel {
  private http = inject(HttpClient);

  obtener(): Observable<RespuestaPanel> { // trae el resumen y las alertas del dashboard
    // withCredentials para que la cookie de sesión viaje entre localhost:4200 y localhost:3000
    return this.http.get<RespuestaPanel>(`${environment.apiUrl}/api/dashboard`, { withCredentials: true });
  }
}
