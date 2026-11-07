import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Machine {
  id: string;
  name: string;
  qrCode: string;
  youtubeUrl?: string;
  videoTitle?: string;
  group?: string;
  instructions?: string;
  videos?: Array<{ id: string; youtubeUrl: string; title: string }>;
}

@Injectable({
  providedIn: 'root'
})
export class MachineService {
  private apiUrl = `${environment.apiUrl}/api/machines`;
  private options = { withCredentials: true };

  constructor(private http: HttpClient) {}

  getMachines(): Observable<Machine[]> {
    return this.http.get<Machine[]>(this.apiUrl, this.options);
  }

  getMachineById(id: string): Observable<Machine> {
    return this.http.get<Machine>(`${this.apiUrl}/${id}`, this.options);
  }

  createMachine(machineData: any): Observable<Machine> {
    return this.http.post<Machine>(this.apiUrl, machineData, this.options);
  }

  deleteMachine(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, this.options);
  }
}