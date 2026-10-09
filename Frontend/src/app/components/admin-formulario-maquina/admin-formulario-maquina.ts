import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// youtube.com/watch?v=, youtu.be/, youtube.com/shorts/ y youtube.com/embed/; el ID debe ser exactamente de 11 caracteres válidos
const PATRON_YOUTUBE = /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&#\/].*)?$/i;

@Component({
  selector: 'app-admin-formulario-maquina',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './admin-formulario-maquina.html',
  styleUrl: './admin-formulario-maquina.css'
})
export class AdminFormularioMaquinaComponent {

  nombreMaquina = 'Prensa de Piernas 45° Inclinada';

  grupoMuscular = 'Cuádriceps y Glúteos';

  instrucciones =
    'Ajustar respaldo a posición fija. Apoyar zona lumbar firmemente en el cojín. Bloquear seguro antes de colocar carga máxima.';

  enlaceVideo = '';

  tituloVideo = '';

  enlaceInvalido = false; // hay texto en el enlace pero no es un enlace de YouTube válido

  // se calcula una sola vez al cambiar el enlace: si se generara en un getter, Angular
  // recibiría un objeto nuevo en cada ciclo y el iframe se recargaría sin parar
  urlVideo: SafeResourceUrl | null = null;

  mostrarToast = false;

  idMaquina = 'QR-MCH-8942-PR45';

  gruposMusculares = [
    'Cuádriceps y Glúteos',
    'Pecho y Tríceps',
    'Espalda Completa',
    'Cardio & HIIT'
  ];

  constructor(private router: Router, private sanitizer: DomSanitizer) {}

  regresar() {
    this.router.navigate(['/admin/maquinas']);
  }

  seleccionarGrupo(grupo: string) {
    this.grupoMuscular = grupo;
  }

  cambiarEnlaceVideo(enlace: string) {
    this.enlaceVideo = enlace;
    const texto = enlace.trim();
    const id = PATRON_YOUTUBE.exec(texto)?.[1] ?? null;

    this.enlaceInvalido = texto !== '' && !id;

    // la URL del iframe se arma solo con el ID ya validado, nunca con el texto escrito;
    // el sanitizer solo recibe esa URL construida
    this.urlVideo = id
      ? this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`
        )
      : null;
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

    // el video es opcional, pero si hay enlace debe ser válido y llevar título
    if (this.enlaceInvalido) {
      alert('Pega un enlace válido de YouTube.');
      return;
    }

    if (this.urlVideo && !this.tituloVideo.trim()) {
      alert('Escribe un título para el video.');
      return;
    }

    this.mostrarToast = true;

    setTimeout(() => {
      this.mostrarToast = false;
      this.router.navigate(['/admin/maquinas']);
    }, 2500);
  }
}