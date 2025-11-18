import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Observable, map } from 'rxjs';

export interface Post {
  _id: string;
  titulo: string;
  descripcion: string;
  imagenUrl?: string;
  autor: {
    _id: string;
    nombreUsuario: string;
    imagenPerfil: string;
  };
  likes: string[];
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostUI extends Post {
  likesCount: number;
  likedByMe: boolean;
  isMine: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  /** Convertir Post → PostUI */
  private toUI(post: Post): PostUI {
    const currentUser = this.auth.currentUser();

    return {
      ...post,
      likesCount: post.likes.length,
      likedByMe: post.likes.includes(currentUser?._id ?? ''),
      isMine: post.autor._id === currentUser?._id,
    };
  }

  /** Listado general con paginación */
  getPosts(orden: 'fecha' | 'likes', offset: number, limit: number) {
    return this.api
      .get<Post[]>(`/posts?orden=${orden}&offset=${offset}&limit=${limit}`)
      .pipe(map((posts) => posts.map((p) => this.toUI(p))));
  }

  /** Listar publicaciones de un usuario específico */
  getPostsByUser(userId: string, orden: 'fecha' | 'likes' = 'fecha', limit = 9, offset = 0) {
    return this.api
      .get<Post[]>(`/posts?usuario=${userId}&orden=${orden}&limit=${limit}&offset=${offset}`)
      .pipe(map((posts) => posts.map((p) => this.toUI(p))));
  }

  /** Like */
  like(postId: string) {
    return this.api.post<{ totalLikes: number }>(`/posts/${postId}/like`, {});
  }

  /** Unlike */
  unlike(postId: string) {
    return this.api.delete<{ totalLikes: number }>(`/posts/${postId}/like`);
  }

  /** Delete */
  delete(postId: string) {
    return this.api.delete(`/posts/${postId}`);
  }

  /** Crear publicación */
  createPost(formData: FormData) {
    return this.api.post<Post>('/posts', formData);
  }
}
