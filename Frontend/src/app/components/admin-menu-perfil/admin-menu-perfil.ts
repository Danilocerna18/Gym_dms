import { Component, DestroyRef, ElementRef, HostListener, inject, input, signal, viewChild } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth';

// Círculo con las iniciales del admin y su menú de perfil. Se usa dentro de los
// encabezados de cada pantalla del admin, que siguen siendo propios de cada una.
// Los datos salen de auth.profile(), que el rolGuard ya cargó con auth.session().
@Component({
  selector: 'app-admin-menu-perfil',
  standalone: true,
  templateUrl: './admin-menu-perfil.html',
})
export class AdminMenuPerfil {
  readonly auth = inject(AuthService);
  private host = inject(ElementRef<HTMLElement>);

  tamano = input<'sm' | 'md'>('md'); // sm = 32px (encabezados móviles), md = 40px (escritorio)
  oscuro = input(false); // true sobre fondo ink (escáner): círculo y foco en cream
  abierto = signal(false);

  private boton = viewChild.required<ElementRef<HTMLButtonElement>>('boton');

  constructor() {
    // Se cierra al navegar a otra pantalla
    inject(Router).events.pipe(
      filter(evento => evento instanceof NavigationStart),
      takeUntilDestroyed(inject(DestroyRef))
    ).subscribe(() => this.abierto.set(false));
  }

  alternar() {
    this.abierto.update(abierto => !abierto);
  }

  @HostListener('document:click', ['$event'])
  cerrarAlTocarFuera(evento: MouseEvent) {
    if (this.abierto() && !this.host.nativeElement.contains(evento.target as Node)) {
      this.abierto.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  cerrarConEscape() {
    if (!this.abierto()) return;
    this.abierto.set(false);
    this.boton().nativeElement.focus(); // el foco vuelve al círculo para seguir con el teclado
  }

  cerrarSesion() { // misma lógica de siempre: AuthService.logout()
    this.abierto.set(false);
    this.auth.logout();
  }
}
