import { Injectable, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface LoginResponse {
  token: string;
  usuario: User;
}

export interface User {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  perfil: string;
  fechaNacimiento?: string;
  descripcion?: string;
  imagenPerfil?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // === Claves constantes ===
  private readonly TOKEN_KEY = 'jwt_token';
  private readonly USER_KEY = 'user_data';

  // === Estado reactivo ===
  private _currentUser = signal<User | null>(this.loadUser());
  readonly currentUser = computed(() => this._currentUser());
  readonly isLoggedIn = computed(() => !!this._currentUser());

  constructor(private api: ApiService) {}

  // ==========================================================
  // AUTENTICACIÓN
  // ==========================================================

  /**
   * Inicia sesión contra el backend
   */
  login(identifier: string, password: string): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/login', { identifier, password });
  }

  /**
   * Registro de usuario (se usa en el RegisterComponent)
   */
  register(data: FormData): Observable<any> {
    return this.api.post('/auth/register', data);
  }

  /**
   * Valida el token guardado usando /auth/authorize
   * El token va automáticamente en Authorization gracias al interceptor
   */
  authorize(): Observable<any> {
    return this.api.post('/auth/authorize', {});
  }

  /**
   * Refresca el token (genera uno nuevo con 15 minutos de validez)
   * El token actual va automáticamente en Authorization gracias al interceptor
   */
  refresh(): Observable<{ token: string; message: string }> {
    return this.api.post<{ token: string; message: string }>('/auth/refresh', {});
  }

  // ==========================================================
  // SESIÓN LOCAL
  // ==========================================================

  /**
   * Guarda token y usuario en localStorage
   */
  setSession(token: string, usuario: User): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(usuario));
      this._currentUser.set(usuario);
    } catch (err) {
      console.error('Error guardando sesión:', err);
    }
  }

  /**
   * Actualiza solo el token (usado en refresh)
   */
  updateToken(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (err) {
      console.error('Error actualizando token:', err);
    }
  }

  /**
   * Limpia los datos de sesión (logout)
   */
  clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
  }

  /**
   * Recupera el usuario al iniciar la app
   */
  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      if (!raw || raw === 'undefined' || raw === 'null') return null;
      return JSON.parse(raw) as User;
    } catch (error) {
      console.error('Error al parsear user_data:', error);
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }

  /**
   * Obtiene el token JWT almacenado
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
