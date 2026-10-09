import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface InstructionVideo {
  id: string;
  machineId: string;
  youtubeUrl: string;
  title: string;
  createdAt?: string;
}

interface Machine {
  id: string;
  name: string;
  qrCode?: string;
  description?: string;
  muscleGroup?: string;
  videos?: InstructionVideo[];
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
  safeVideoUrl: SafeResourceUrl | null = null;
  videoTitle: string = '';

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const stateData = history.state?.machineData;
    
    if (stateData) {
      this.machine = stateData;
    } else {
      // Datos demo de fallback
      this.machine = {
        id: '001',
        name: 'Prensa 45°',
        description: 'Ajusta el respaldo y empuja con la planta completa de los pies. No bloquees las rodillas al extender.',
        muscleGroup: 'Pierna',
        videos: [
          {
            id: 'v1',
            machineId: '001',
            youtubeUrl: 'https://www.youtube.com/watch?v=Yy5pL-0_gY8',
            title: 'Técnica Correcta en Prensa'
          }
        ]
      };
    }

    // Extraer el primer video si existe en la relación de Prisma
    if (this.machine?.videos && this.machine.videos.length > 0) {
      const primaryVideo = this.machine.videos[0];
      this.videoTitle = primaryVideo.title;
      this.safeVideoUrl = this.getSafeEmbedUrl(primaryVideo.youtubeUrl);
    }
  }

  // Convierte URLs de YouTube estándar a URLs seguras para iframe de Angular
  private getSafeEmbedUrl(url: string): SafeResourceUrl | null {
    const videoId = this.extractYouTubeId(url);
    if (!videoId) return null;
    
    const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  private extractYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  }

  goBack(): void {
    this.router.navigate(['/user-home']);
  }
}