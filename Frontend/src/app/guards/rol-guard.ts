import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService, homeFor } from '../services/auth';

export const rolGuard: CanActivateFn = route => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.session().pipe(
    map(({ user }) => user.role === route.data['role'] || router.parseUrl(homeFor(user.role))),
    catchError(() => {
      auth.profile.set(null);
      return of(router.parseUrl('/login'));
    })
  );
};
