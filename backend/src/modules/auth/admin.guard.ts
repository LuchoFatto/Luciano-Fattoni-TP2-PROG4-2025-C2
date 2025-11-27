import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

/**
 * Guard que valida si el usuario autenticado tiene perfil de administrador.
 * Debe usarse junto con JwtAuthGuard:
 * @UseGuards(JwtAuthGuard, AdminGuard)
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (user.perfil !== 'administrador') {
      throw new ForbiddenException(
        'Acceso denegado. Se requieren permisos de administrador',
      );
    }

    return true;
  }
}
