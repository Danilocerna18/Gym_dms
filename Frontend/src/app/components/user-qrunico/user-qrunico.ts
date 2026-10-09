import { Component } from '@angular/core';

@Component({
  selector: 'app-user-qrunico',
  standalone: true,
  imports: [],
  templateUrl: './user-qrunico.html',
  styleUrl: './user-qrunico.css',
})
export class UserQrunico {

  // Lógica para copiar el código manual al portapapeles
  copyAccessCode(copyBtn: HTMLButtonElement, copyIcon: HTMLElement, copyText: HTMLElement): void {
    const code = 'GS-9821-ENT';

    navigator.clipboard.writeText(code).then(() => {
      copyIcon.textContent = 'check';
      copyText.textContent = 'LISTO';
      copyBtn.classList.add('bg-track-green', 'text-chalk-50');

      setTimeout(() => {
        copyIcon.textContent = 'content_copy';
        copyText.textContent = 'COPIAR';
        copyBtn.classList.remove('bg-track-green', 'text-chalk-50');
      }, 2000);
    }).catch(() => {
      copyText.textContent = 'GS-9821';
    });
  }

  // Navegación hacia atrás
  goBack(): void {
    history.back();
  }
}