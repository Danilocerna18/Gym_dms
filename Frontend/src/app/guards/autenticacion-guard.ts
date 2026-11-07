import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService, homeFor } from '../services/auth';

// Evita mostrar el formulario de acceso si la sesión sigue activa.
export const autenticacionGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.session().pipe(
    map(({ user }) => router.parseUrl(homeFor(user.role))),
    catchError(() => {
      auth.profile.set(null);
      return of(true);
    })
  );
};
