import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor JWT
 * - Adjunta token a todas las requests
 * - Maneja 401 y 403
 */
export const authTokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const auth = inject(AuthService);
  const alerts = inject(AlertService);
  const router = inject(Router);

  const token = auth.getToken();

  // Si hay token, lo clona con headers
  const clone = token
    ? req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      })
    : req;

  return next(clone).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        alerts.error('Sesión expirada. Inicia sesión nuevamente.');
        auth.clearSession();
        router.navigate(['/login']);
      }

      if (error.status === 403) {
        alerts.warning('No tienes permisos para esta acción.');
      }

      return throwError(() => error);
    })
  );
};
