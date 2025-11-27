import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

// Interfaces para las respuestas de estadísticas
export interface PostsByUserData {
  usuarioId: string;
  nombreUsuario: string;
  imagenPerfil?: string;
  totalPosts: number;
}

export interface PostsByUserResponse {
  message: string;
  startDate: string | null;
  endDate: string | null;
  data: PostsByUserData[];
}

export interface CommentsTotalResponse {
  message: string;
  startDate: string | null;
  endDate: string | null;
  total: number;
}

export interface PostsStatusData {
  activos: number;
  inactivos: number;
  total: number;
}

export interface PostsStatusResponse {
  message: string;
  data: PostsStatusData;
}

export interface CommentsByPostData {
  postId: string;
  titulo: string;
  imagenUrl?: string;
  totalComments: number;
}

export interface CommentsByPostResponse {
  message: string;
  startDate: string | null;
  endDate: string | null;
  data: CommentsByPostData[];
}

export interface PostsByLikesData {
  _id: string;
  titulo: string;
  imagenUrl?: string;
  likesCount: number;
}

export interface PostsByLikesResponse {
  message: string;
  data: PostsByLikesData[];
}

/**
 * Servicio para consumir endpoints de estadísticas (solo admins)
 */
@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private api = inject(ApiService);

  /**
   * Obtiene cantidad de publicaciones por usuario
   * @param startDate Fecha inicio (opcional) en formato ISO
   * @param endDate Fecha fin (opcional) en formato ISO
   */
  getPostsByUser(startDate?: string, endDate?: string): Observable<PostsByUserResponse> {
    let url = '/statistics/posts-by-user';
    const params: string[] = [];

    if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.api.get<PostsByUserResponse>(url);
  }

  /**
   * Obtiene total de comentarios
   * @param startDate Fecha inicio (opcional) en formato ISO
   * @param endDate Fecha fin (opcional) en formato ISO
   */
  getCommentsTotal(startDate?: string, endDate?: string): Observable<CommentsTotalResponse> {
    let url = '/statistics/comments-total';
    const params: string[] = [];

    if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.api.get<CommentsTotalResponse>(url);
  }

  /**
   * Obtiene distribución de posts activos e inactivos
   */
  getPostsStatus(): Observable<PostsStatusResponse> {
    return this.api.get<PostsStatusResponse>('/statistics/posts-status');
  }

  /**
   * Obtiene cantidad de comentarios por publicación
   * @param startDate Fecha inicio (opcional) en formato ISO
   * @param endDate Fecha fin (opcional) en formato ISO
   */
  getCommentsByPost(startDate?: string, endDate?: string): Observable<CommentsByPostResponse> {
    let url = '/statistics/comments-by-post';
    const params: string[] = [];

    if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.api.get<CommentsByPostResponse>(url);
  }

  /**
   * Obtiene posts más populares por cantidad de likes
   */
  getPostsByLikes(): Observable<PostsByLikesResponse> {
    return this.api.get<PostsByLikesResponse>('/statistics/posts-by-likes');
  }
}
