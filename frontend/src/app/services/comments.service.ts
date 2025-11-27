import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface CommentUI {
  _id: string;
  post: string;
  autor: {
    _id: string;
    nombreUsuario: string;
    imagenPerfil?: string;
  };
  mensaje: string;
  modificado: boolean;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private api = inject(ApiService);

  /** Obtener comentarios paginados de un post */
  getComments(postId: string, limit: number, offset: number): Observable<CommentUI[]> {
    return this.api.get<CommentUI[]>(`/comments/post/${postId}?limit=${limit}&offset=${offset}`);
  }

  /** Crear comentario en un post */
  createComment(postId: string, mensaje: string): Observable<CommentUI> {
    return this.api.post<CommentUI>(`/comments/post/${postId}`, { mensaje });
  }

  /** Editar comentario (PUT según tu controller) */
  updateComment(id: string, mensaje: string): Observable<CommentUI> {
    return this.api.put<CommentUI>(`/comments/${id}`, { mensaje });
  }

  /** Eliminar comentario */
  deleteComment(id: string): Observable<any> {
    return this.api.delete(`/comments/${id}`);
  }
}
