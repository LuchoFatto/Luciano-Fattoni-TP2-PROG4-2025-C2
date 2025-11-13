import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * AuthGuard: protege rutas privadas verificando si hay sesión activa.
 * Si no hay token => redirige al login.
 * Si hay sesión => permite continuar.
 */
export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.parseUrl('/login');
  }

  return true;
};
