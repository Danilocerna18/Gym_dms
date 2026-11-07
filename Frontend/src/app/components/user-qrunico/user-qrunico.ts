import qrcode from 'qrcode-generator';
import { NgClass } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Aforo, RespuestaAforo } from '../../services/aforo';
import { inject, Component, DestroyRef, OnInit, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap, timer } from 'rxjs';

const INTERVALO_AFORO_MS = 15000;

const ESTILO_AFORO = {
  optimo: { etiqueta: 'ÓPTIMO', texto: 'text-track-green', fondo: 'bg-track-green/15' },
  concurrido: { etiqueta: 'CONCURRIDO', texto: 'text-ink', fondo: 'bg-ink/10' },
  lleno: { etiqueta: 'LLENO', texto: 'text-alert-red', fondo: 'bg-alert-red/15' },
} as const;

@Component({
  selector: 'app-user-qrunico',
  standalone: true,
  imports: [NgClass],
  templateUrl: './user-qrunico.html',
  styleUrl: './user-qrunico.css',
})
export class UserQrunico implements OnInit {
  readonly auth = inject(AuthService);
  private aforoService = inject(Aforo);
  private destroyRef = inject(DestroyRef);

  aforo = signal<RespuestaAforo | null>(null);
  aforoNoDisponible = signal(false);
  estiloAforo = computed(() => ESTILO_AFORO[this.aforo()?.estado ?? 'optimo']);
  trazoAnillo = computed(() => `${Math.min(this.aforo()?.porcentaje ?? 0, 100)}, 100`);

  ngOnInit() {
    timer(0, INTERVALO_AFORO_MS).pipe(
      switchMap(() => this.aforoService.obtener().pipe(
        map(respuesta => ({ respuesta })),
        catchError(() => of({ respuesta: null }))
      )),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(({ respuesta }) => {
      this.aforo.set(respuesta);
      this.aforoNoDisponible.set(respuesta === null);
    });
  }

  readonly qrImage = this.createQr();

  private createQr(): string {
    const code = this.auth.profile()?.qrCode || this.auth.profile()?.id || 'GYMSYNC-USER';
    const qr = qrcode(0, 'M');
    qr.addData(code);
    qr.make();
    return qr.createDataURL(6);
  }

  copyAccessCode(copyBtn: HTMLButtonElement, copyIcon: HTMLElement, copyText: HTMLElement): void {
    const code = this.auth.profile()?.qrCode || this.auth.profile()?.id;
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
      copyText.textContent = 'Error';
    });
  }

  goBack(): void {
    history.back();
  }
}