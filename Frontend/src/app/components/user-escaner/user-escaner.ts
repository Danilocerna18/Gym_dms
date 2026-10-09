import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-escaner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-escaner.html',
  styleUrl: './user-escaner.css'
})
export class UserEscanerComponent {

  constructor(private router: Router) {}

  // Simulación de escaneo al tocar la zona o cargar imagen
  onScanSuccess(): void {
    this.router.navigate(['/user-maquinadet'], {
      state: {
        machineData: {
          id: 'm2',
          name: 'Extensión de Cuádriceps',
          description: 'Aislamiento directo para cuadriceps. Mantén la espalda pegada al respaldo y controla el movimiento.',
          muscleGroup: 'Pierna'
        }
      }
    });
  }

  closeScanner(): void {
    this.router.navigate(['/user-home']);
  }
}