import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MachineService } from '../../services/machine.service';

@Component({
  selector: 'app-admin-formulario-maquina',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-formulario-maquina.html',
  styleUrl: './admin-formulario-maquina.css'
})
export class AdminFormularioMaquinaComponent implements OnInit {

  nombreMaquina: string = '';
  grupoMuscular: string = 'Piernas';
  instrucciones: string = '';
  youtubeUrl: string = '';
  idMaquina: string = '';

  mostrarToast: boolean = false;
  guardando: boolean = false;
  errorMensaje: string = '';

  gruposMusculares: string[] = [
    'Piernas',
    'Pecho',
    'Espalda',
    'Bíceps',
    'Tríceps',
    'Hombros'
  ];

  constructor(
    private machineService: MachineService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.generarNuevoId();
  }

  generarNuevoId(): void {
    const aleatorio = Math.floor(100 + Math.random() * 900);
    this.idMaquina = `MAC-${aleatorio}`;
  }

  seleccionarGrupo(grupo: string): void {
    this.grupoMuscular = grupo;
  }

  copiarId(): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.idMaquina);
    }
  }

  descargarQR(): void {
    window.print();
  }

  regresar(): void {
    this.router.navigate(['/admin/maquinas']);
  }

  guardarMaquina(): void {
    if (!this.nombreMaquina.trim() || !this.youtubeUrl.trim()) {
      this.errorMensaje = 'Ingresa el nombre y la URL de YouTube.';
      return;
    }

    this.guardando = true;

    const payload = {
      id: this.idMaquina,
      name: this.nombreMaquina.trim(),
      qrCode: this.idMaquina,
      youtubeUrl: this.youtubeUrl.trim(),
      videoTitle: `Tutorial de ${this.nombreMaquina.trim()}`,
      group: this.grupoMuscular || 'Piernas',
      instructions: this.instrucciones.trim()
    };

    this.machineService.createMachine(payload).subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarToast = true;
        setTimeout(() => {
          this.mostrarToast = false;
          this.generarNuevoId();
          this.router.navigate(['/admin/maquinas']);
        }, 1500);
      },
      error: (err) => {
        this.guardando = false;
        console.error('Error al guardar máquina:', err);
        this.errorMensaje = 'Error al guardar en la base de datos.';
      }
    });
  }

  resetFormulario(): void {
    this.nombreMaquina = '';
    this.instrucciones = '';
    this.youtubeUrl = '';
    this.grupoMuscular = 'Piernas';
    this.generarNuevoId();
  }
}