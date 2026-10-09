import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Machine {
  id: string;
  name: string;
  description?: string;
  muscleGroup?: string;
}

@Component({
  selector: 'app-user-maquinadet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-maquinadet.html',
  styleUrl: './user-maquinadet.css'
})
export class UserMaquinadetComponent implements OnInit {

  machine: Machine | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const stateData = history.state?.machineData;
    
    if (stateData) {
      this.machine = stateData;
    } else {
      this.machine = {
        id: 'm2',
        name: 'Extensión de Cuádriceps',
        description: 'Aislamiento directo para cuadriceps. Mantén la espalda pegada al respaldo y controla el movimiento.',
        muscleGroup: 'Pierna'
      };
    }
  }

  // Redirige siempre a home para evitar bucles con el escáner
  goBack(): void {
    this.router.navigate(['/user-home']);
  }
}