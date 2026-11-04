import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { MachineService } from '../../services/machine.service';

@Component({
  selector: 'app-user-escaner',
  standalone: true,
  imports: [CommonModule, RouterModule, ZXingScannerModule],
  templateUrl: './user-escaner.html',
  styleUrl: './user-escaner.css'
})
export class UserEscanerComponent {

  allowedFormats = [BarcodeFormat.QR_CODE];
  cargando: boolean = false;
  errorMensaje: string = '';
  scannerHabilitado: boolean = true;

  // Mock temporal para el usuario en pantalla si tu servicio auth no está disponible
  auth = {
    initials: () => 'US',
    profile: () => ({ name: 'Usuario Gym' })
  };

  constructor(
    private machineService: MachineService,
    private router: Router
  ) {}

  // Se activa al detectar un QR en la cámara
  onScanSuccess(qrResult?: string): void {
    if (this.cargando) return;

    // Si hace clic en simular o desde la galería sin string previa
    const idFinal = qrResult ? qrResult.trim() : 'MAC-482';

    this.scannerHabilitado = false;
    this.cargando = true;
    this.errorMensaje = '';

    this.machineService.getMachineById(idFinal).subscribe({
      next: (machineData) => {
        this.cargando = false;
        this.router.navigate(['/user-maquinadet'], {
          state: { machineData }
        });
      },
      error: (err) => {
        this.cargando = false;
        this.errorMensaje = `No se encontró la máquina "${idFinal}".`;
        
        setTimeout(() => {
          this.errorMensaje = '';
          this.scannerHabilitado = true;
        }, 3000);
      }
    });
  }

  closeScanner(): void {
    this.router.navigate(['/user-home']);
  }
}