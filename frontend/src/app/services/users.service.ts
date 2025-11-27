import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { User } from './auth.service';

export interface UsersResponse {
  message: string;
  usuarios: User[];
}

export interface UserResponse {
  message: string;
  usuario: User;
}

/**
 * UsersService - Gestión de usuarios (solo admins)
 * Consume endpoints /users del backend
 */
@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private api = inject(ApiService);

  /**
   * GET /users - Lista todos los usuarios
   * Solo accesible por administradores
   */
  getAll(): Observable<UsersResponse> {
    return this.api.get<UsersResponse>('/users');
  }

  /**
   * POST /users - Crear nuevo usuario (admin puede elegir perfil)
   * @param formData - FormData con nombre, apellido, correo, nombreUsuario,
   *                   password, perfil, imagenPerfil (opcional), etc.
   */
  create(formData: FormData): Observable<UserResponse> {
    return this.api.post<UserResponse>('/users', formData);
  }

  /**
   * DELETE /users/:id - Deshabilita un usuario (baja lógica)
   * @param id - ID del usuario a deshabilitar
   */
  disable(id: string): Observable<UserResponse> {
    return this.api.delete<UserResponse>(`/users/${id}`);
  }

  /**
   * POST /users/:id/activate - Rehabilita un usuario (alta lógica)
   * @param id - ID del usuario a habilitar
   */
  enable(id: string): Observable<UserResponse> {
    return this.api.post<UserResponse>(`/users/${id}/activate`, {});
  }
}
