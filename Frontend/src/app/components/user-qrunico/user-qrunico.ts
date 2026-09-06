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

  // Lógica para exportar a Wallet
  triggerWalletFeedback(btn: HTMLButtonElement): void {
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<span class="material-symbols-outlined text-[20px] text-track-green">check_circle</span><span class="font-headline-md text-headline-md uppercase">Pase Exportado</span>';

    setTimeout(() => {
      btn.innerHTML = originalContent;
    }, 2200);
  }

  // Alternar brillo máximo
  toggleBrightness(btn: HTMLButtonElement): void {
    btn.classList.toggle('bg-primary');
    btn.classList.toggle('text-on-primary');
  }

  // Animación de actualización del pase
  refreshAccessPass(btn: HTMLButtonElement): void {
    const icon = btn.querySelector<HTMLElement>('.material-symbols-outlined');
    if (icon) {
      icon.classList.add('rotate-180');
      icon.style.transition = 'transform 0.4s ease';

      setTimeout(() => {
        icon.classList.remove('rotate-180');
      }, 400);
    }
  }

  // Navegación hacia atrás
  goBack(): void {
    history.back();
  }
}