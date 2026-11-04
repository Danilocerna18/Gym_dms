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
    this.router.navigate(['/user-home']);
  }

  guardarMaquina(): void {
  if (!this.nombreMaquina.trim() || !this.youtubeUrl.trim()) {
    this.errorMensaje = 'Ingresa el nombre y la URL de YouTube.';
    return;
  }

  this.guardando = true;

  const payload = {
    id: this.idMaquina,
    name: this.nombreMaquina,
    qrCode: this.idMaquina,
    youtubeUrl: this.youtubeUrl,
    videoTitle: `Tutorial de ${this.nombreMaquina}`,
    group: this.grupoMuscular,
    instructions: this.instrucciones
  };

  this.machineService.createMachine(payload).subscribe({
    next: () => {
      this.guardando = false;
      this.mostrarToast = true;
      setTimeout(() => {
        this.mostrarToast = false;
        this.router.navigate(['/user-home']);
      }, 1500);
    },
    error: (err) => {
      this.guardando = false;
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