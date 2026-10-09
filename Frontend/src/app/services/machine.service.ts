import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateMachineDto {
  id: string;
  name: string;
  qrCode?: string;
  youtubeUrl: string;
  videoTitle?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MachineService {
  private baseUrl = 'http://localhost:3000/api/machines';

  constructor(private http: HttpClient) {}

  // Petición POST enviada desde admin-formulario-maquina
  createMachine(data: CreateMachineDto): Observable<any> {
    return this.http.post<any>(this.baseUrl, data);
  }

  // Petición GET consultada por el usuario
  getMachineById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }
}