import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import qrcode from 'qrcode-generator';

interface InstructionVideo {
  id?: string;
  machineId?: string;
  youtubeUrl: string;
  title?: string;
}

interface Machine {
  id: string;
  name: string;
  qrCode?: string;
  description?: string;
  muscleGroup?: string;
  youtubeUrl?: string;
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
  qrImage: string = '';

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const stateData = history.state?.machineData;

    if (stateData) {
      this.machine = stateData;
    } else {
      this.machine = {
        id: '001',
        name: 'Prensa de Pierna',
        description: 'Ajusta el respaldo y empuja con la planta completa de los pies. No bloquees las rodillas al extender.',
        muscleGroup: 'Pierna & Glúteo',
        videos: [
          {
            youtubeUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
            title: 'Técnica Correcta en Prensa'
          }
        ]
      };
    }

    this.processMachineVideo();
    this.generateMachineQr();
  }

  private generateMachineQr(): void {
  // Toma el qrCode único que viene de NeonDB
  const code = this.machine?.qrCode || this.machine?.id;
  if (!code) return;

  const qr = qrcode(0, 'M');
  qr.addData(code);
  qr.make();
  this.qrImage = qr.createDataURL(6);
}

  private processMachineVideo(): void {
    let rawUrl = '';

    if (this.machine?.videos && this.machine.videos.length > 0 && this.machine.videos[0].youtubeUrl) {
      rawUrl = this.machine.videos[0].youtubeUrl;
      this.videoTitle = this.machine.videos[0].title || this.machine.name;
    } else if (this.machine?.youtubeUrl) {
      rawUrl = this.machine.youtubeUrl;
      this.videoTitle = this.machine.name;
    } else {
      rawUrl = 'https://www.youtube.com/watch?v=IZxyjW7MPJQ';
      this.videoTitle = this.machine?.name || 'Tutorial de Máquina';
    }

    this.safeVideoUrl = this.getSafeEmbedUrl(rawUrl);
  }

  private getSafeEmbedUrl(url: string): SafeResourceUrl | null {
    const videoId = this.extractYouTubeId(url);
    if (!videoId) return null;

    const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  private extractYouTubeId(url: string): string | null {
    if (!url) return null;
    
    if (url.length === 11 && !url.includes('/') && !url.includes('.')) {
      return url;
    }

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);

    return (match && match[2].length === 11) ? match[2] : null;
  }

  goBack(): void {
    this.router.navigate(['/user-home']);
  }
}