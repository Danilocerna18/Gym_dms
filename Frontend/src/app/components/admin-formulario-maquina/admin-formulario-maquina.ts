import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-formulario-maquina',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './admin-formulario-maquina.html',
  styleUrl: './admin-formulario-maquina.css'
})
export class AdminFormularioMaquinaComponent {

  nombreMaquina = 'Prensa de Piernas 45° Inclinada';

  grupoMuscular = 'Cuádriceps y Glúteos';

  instrucciones =
    'Ajustar respaldo a posición fija. Apoyar zona lumbar firmemente en el cojín. Bloquear seguro antes de colocar carga máxima.';

  videoSeleccionado: File | null = null;

  mostrarVideo = true;

  mostrarToast = false;

  idMaquina = 'QR-MCH-8942-PR45';

  gruposMusculares = [
    'Cuádriceps y Glúteos',
    'Pecho y Tríceps',
    'Espalda Completa',
    'Cardio & HIIT'
  ];

  constructor(private router: Router) {}

  regresar() {
    this.router.navigate(['/admin-lista-maquinas']);
  }

  seleccionarGrupo(grupo: string) {
    this.grupoMuscular = grupo;
  }

  abrirSelectorVideo(input: HTMLInputElement) {
    input.click();
  }

  seleccionarVideo(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {

      const archivo = input.files[0];

      if (archivo.size > 150 * 1024 * 1024) {
        alert('El video no puede superar los 150 MB.');
        input.value = '';
        return;
      }

      this.videoSeleccionado = archivo;
      this.mostrarVideo = true;
    }
  }

  eliminarVideo() {
    this.videoSeleccionado = null;
    this.mostrarVideo = false;
  }

  copiarId() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.idMaquina);
    }

    alert('ID copiado: ' + this.idMaquina);
  }

  descargarQR() {
    alert('Preparando QR para imprimir...');
  }

  guardarMaquina() {

    if (!this.nombreMaquina.trim()) {
      alert('Debes ingresar el nombre de la máquina.');
      return;
    }

    if (!this.grupoMuscular) {
      alert('Debes seleccionar un grupo muscular.');
      return;
    }

    this.mostrarToast = true;

    setTimeout(() => {
      this.mostrarToast = false;
      this.router.navigate(['/admin-lista-maquinas']);
    }, 2500);
  }
}