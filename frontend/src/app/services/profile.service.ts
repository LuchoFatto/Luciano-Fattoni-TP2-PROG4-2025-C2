import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Observable, map } from 'rxjs';
import { Post, PostUI } from './posts.service';

export interface ProfileData {
  _id: string;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  correo: string;
  perfil: string;
  fechaNacimiento?: string;
  descripcion?: string;
  imagenPerfil?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  /**
   * Datos del usuario logueado desde el AuthService
   */
  getMyProfile(): ProfileData | null {
    return this.auth.currentUser();
  }

  /**
   * Últimas publicaciones (3)
   * Para mostrar en la parte superior del perfil
   */
  getMyLastPosts(limit = 3): Observable<PostUI[]> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('No hay usuario logueado.');

    return this.api
      .get<Post[]>(`/posts?usuario=${user._id}&limit=${limit}&orden=fecha`)
      .pipe(map((posts) => posts.map((p) => this.toUI(p))));
  }

  /**
   * Listado completo de publicaciones del usuario
   * Para la grilla grande ("Todas tus publicaciones")
   */
  getMyAllPosts(): Observable<PostUI[]> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('No hay usuario logueado.');

    return this.api
      .get<Post[]>(`/posts?usuario=${user._id}&orden=fecha`)
      .pipe(map((posts) => posts.map((p) => this.toUI(p))));
  }

  /**
   * Cantidad total de publicaciones
   */
  getMyPostsCount(): Observable<number> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('No hay usuario logueado.');

    return this.api.get<Post[]>(`/posts?usuario=${user._id}`).pipe(map((list) => list.length));
  }

  /**
   * Conversión local a PostUI
   */
  private toUI(post: Post): PostUI {
    const currentUser = this.auth.currentUser();

    return {
      ...post,
      likesCount: post.likes.length,
      likedByMe: post.likes.includes(currentUser?._id ?? ''),
      isMine: post.autor._id === currentUser?._id,
    };
  }
}
