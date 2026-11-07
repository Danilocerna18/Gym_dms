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

  auth = {
    initials: () => 'US',
    profile: () => ({ name: 'Usuario Gym' })
  };

  constructor(
    private machineService: MachineService,
    private router: Router
  ) {}

  onScanSuccess(qrResult?: string): void {
    if (this.cargando) return;

    if (!qrResult || !qrResult.trim()) {
      return;
    }

    const idFinal = qrResult.trim();
    this.scannerHabilitado = false;
    this.cargando = true;
    this.errorMensaje = '';

    this.machineService.getMachineById(idFinal).subscribe({
      next: (res: any) => {
        this.cargando = false;
        
        // Extrae el objeto plano de la máquina (manejando si viene envuelto en .machine o directo)
        const targetMachine = res?.machine ? res.machine : res;

        if (targetMachine && targetMachine.id) {
          this.router.navigate(['/user-maquinadet'], {
            state: { machineData: targetMachine }
          });
        } else {
          this.mostrarError(`No se encontró la máquina "${idFinal}".`);
        }
      },
      error: (err) => {
        console.error('Error al consultar máquina:', err);
        this.cargando = false;
        this.mostrarError(`No existe la máquina con código "${idFinal}".`);
      }
    });
  }

  private mostrarError(msg: string): void {
    this.errorMensaje = msg;
    setTimeout(() => {
      this.errorMensaje = '';
      this.scannerHabilitado = true;
    }, 3000);
  }

  closeScanner(): void {
    this.router.navigate(['/user-home']);
  }
}