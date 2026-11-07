import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MachineService, Machine } from '../../services/machine.service';

export interface MuscleCategory {
  title: string;
  machines: Machine[];
}

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-home.html',
  styleUrl: './user-home.css'
})
export class UserHomeComponent implements OnInit {

  auth = {
    initials: () => 'US',
    profile: () => ({ name: 'Usuario Gym' })
  };

  maquinas: Machine[] = [];
  muscleCategories: MuscleCategory[] = [];
  cargando: boolean = true;

  // URLs fijas de alta resolución según grupo muscular
  private categoryImages: Record<string, string> = {
    piernas: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?q=80&w=600&auto=format&fit=crop',
    biceps: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop',
    bíceps: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop',
    pecho: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop',
    espalda: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=600&auto=format&fit=crop',
    triceps: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop',
    tríceps: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop',
    hombros: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop'
  };

  constructor(
    private machineService: MachineService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarMaquinas();
  }

  cargarMaquinas(): void {
    this.cargando = true;
    this.machineService.getMachines().subscribe({
      next: (data) => {
        this.maquinas = Array.isArray(data) ? data : (data as any).machines || [];
        this.organizarCategorias();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener catálogo de máquinas:', err);
        this.organizarCategorias();
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  organizarCategorias(): void {
    const gruposMap = new Map<string, Machine[]>();

    this.maquinas.forEach((m) => {
      const g = (m.group || 'GENERAL').trim().toUpperCase();

      if (!gruposMap.has(g)) {
        gruposMap.set(g, []);
      }
      gruposMap.get(g)!.push(m);
    });

    this.muscleCategories = Array.from(gruposMap.entries()).map(([title, machines]) => ({
      title,
      machines
    }));
  }

  getGroupImage(group?: string): string {
    const key = (group || '').trim().toLowerCase();
    
    for (const [catKey, url] of Object.entries(this.categoryImages)) {
      if (key.includes(catKey)) {
        return url;
      }
    }
    
    // Imagen default de gimnasio en caso de no coincidir
    return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop';
  }

  openMachineDetail(machine: Machine): void {
    this.router.navigate(['/user-maquinadet'], {
      state: { machineData: machine }
    });
  }
}