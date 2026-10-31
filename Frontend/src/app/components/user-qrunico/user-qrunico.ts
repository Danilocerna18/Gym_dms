import qrcode from 'qrcode-generator';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth';
import { inject, Component } from '@angular/core';

@Component({
  selector: 'app-user-qrunico',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './user-qrunico.html',
  styleUrl: './user-qrunico.css',
})
export class UserQrunico {
  readonly auth = inject(AuthService);


  readonly qrImage = this.createQr();

  private createQr(): string {
    const qr = qrcode(0, 'M');
    qr.addData(this.auth.profile()?.qrCode ?? '');
    qr.make();
    return qr.createDataURL(6);
  }

  // Lógica para copiar el código manual al portapapeles
  copyAccessCode(copyBtn: HTMLButtonElement, copyIcon: HTMLElement, copyText: HTMLElement): void {
    const code = this.auth.profile()?.qrCode;
    if (!code) return;

    navigator.clipboard.writeText(code).then(() => {
      copyIcon.textContent = 'check';
      copyText.textContent = 'LISTO';
      copyBtn.classList.add('bg-track-green', 'text-cream');

      setTimeout(() => {
        copyIcon.textContent = 'content_copy';
        copyText.textContent = 'COPIAR';
        copyBtn.classList.remove('bg-track-green', 'text-cream');
      }, 2000);
    }).catch(() => {
      copyText.textContent = 'No se pudo copiar';
    });
  }

  // Navegación hacia atrás
  goBack(): void {
    history.back();
  }
}