import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

interface Machine {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  muscleGroup: string;
}

interface MuscleCategory {
  title: string;
  machines: Machine[];
}

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-home.html',
  styleUrl: './user-home.css'
})
export class UserHomeComponent {

  muscleCategories: MuscleCategory[] = [
    {
      title: 'Pierna & Glúteo',
      machines: [
        {
          id: 'm1',
          name: 'Prensa de Pierna 45°',
          imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=500&auto=format&fit=crop',
          description: 'Enfocada en cuadriceps y glúteos. Ajusta el respaldo a tu medida y mantén la espalda apoyada.',
          muscleGroup: 'Pierna & Glúteo'
        },
        {
          id: 'm2',
          name: 'Extensión de Cuádriceps',
          imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=500&auto=format&fit=crop',
          description: 'Aislamiento directo para cuadriceps. Controla el peso en el ascenso y descenso.',
          muscleGroup: 'Pierna'
        },
        {
          id: 'm3',
          name: 'Femoral Sentado',
          imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=500&auto=format&fit=crop',
          description: 'Enfoque en isquiotibiales. Ajusta el rodillo justo arriba de los tobillos.',
          muscleGroup: 'Pierna'
        }
      ]
    },
    {
      title: 'Pecho & Tríceps',
      machines: [
        {
          id: 'm4',
          name: 'Press de Pecho Sentado',
          imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=500&auto=format&fit=crop',
          description: 'Excelente opción para trabajar el pectoral mayor de forma guiada y segura.',
          muscleGroup: 'Pecho'
        },
        {
          id: 'm5',
          name: 'Peck Deck / Apertura',
          imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=500&auto=format&fit=crop',
          description: 'Aislamiento para la parte central del pecho con contracción sostenida.',
          muscleGroup: 'Pecho'
        }
      ]
    },
    {
      title: 'Espalda & Bíceps',
      machines: [
        {
          id: 'm6',
          name: 'Jalón al Pecho (Polea)',
          imageUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=500&auto=format&fit=crop',
          description: 'Trabajo integral de dorsales y zona superior de la espalda.',
          muscleGroup: 'Espalda'
        },
        {
          id: 'm7',
          name: 'Remo Gironda (Polea Baja)',
          imageUrl: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=500&auto=format&fit=crop',
          description: 'Enfocado en la densidad de la espalda media y baja.',
          muscleGroup: 'Espalda'
        }
      ]
    }
  ];

  constructor(private router: Router) {}

  openMachineDetail(machine: Machine): void {
    this.router.navigate(['/user-maquinadet'], {
      state: { machineData: machine }
    });
  }
}