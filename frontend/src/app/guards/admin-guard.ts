import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * AdminGuard: protege rutas de administrador.
 * Verifica que el usuario esté autenticado Y tenga perfil de administrador.
 * Si no cumple => redirige a /posts
 */
export const adminGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUser();

  // Si no hay usuario autenticado o no es admin
  if (!user || user.perfil !== 'administrador') {
    return router.parseUrl('/posts');
  }

  return true;
};
