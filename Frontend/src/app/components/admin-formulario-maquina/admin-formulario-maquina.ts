import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MachineService } from '../../services/machine.service';

// youtube.com/watch?v=, youtu.be/, youtube.com/shorts/ y youtube.com/embed/; el ID debe ser exactamente de 11 caracteres válidos
const PATRON_YOUTUBE = /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&#\/].*)?$/i;

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
    this.router.navigate(['/user-home']);
  }

  guardarMaquina(): void {
    this.errorMensaje = '';

    if (!this.nombreMaquina.trim()) {
      this.errorMensaje = 'Por favor ingresa el nombre de la máquina.';
      return;
    }

    if (!this.youtubeUrl.trim()) {
      this.errorMensaje = 'Por favor ingresa la URL del video de YouTube.';
      return;
    }

    this.guardando = true;

    const payload = {
      id: this.idMaquina,
      name: this.nombreMaquina,
      qrCode: this.idMaquina,
      youtubeUrl: this.youtubeUrl,
      videoTitle: `Tutorial de ${this.nombreMaquina}`
    };

    this.machineService.createMachine(payload).subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarToast = true;

        setTimeout(() => {
          this.mostrarToast = false;
          this.resetFormulario();
        }, 3000);
      },
      error: (err) => {
        this.guardando = false;
        this.errorMensaje = err.error?.message || 'Error al guardar la máquina en la base de datos.';
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