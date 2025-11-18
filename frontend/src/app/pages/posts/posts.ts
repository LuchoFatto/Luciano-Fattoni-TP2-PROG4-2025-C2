import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostsService, PostUI } from '../../services/posts.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { PostCardComponent } from '../../shared/ui';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, PostCardComponent],
  templateUrl: './posts.html',
  styleUrl: './posts.css',
})
export class Posts {
  private postsService = inject(PostsService);
  private alerts = inject(AlertService);
  private auth = inject(AuthService);

  // ====== STATE ======
  posts = signal<PostUI[]>([]);
  loading = signal(false);
  loadingMore = signal(false);
  orden = signal<'fecha' | 'likes'>('fecha');

  // Parámetros de paginación
  limit = 5;
  offset = 0;
  noMorePosts = signal(false);

  constructor() {
    this.loadPosts(true);
  }

  /** Cargar publicaciones (inicial o "load more") */
  loadPosts(initial = false) {
    if (initial) {
      this.offset = 0;
      this.noMorePosts.set(false);
      this.posts.set([]);
      this.loading.set(true);
    } else {
      this.loadingMore.set(true);
    }

    this.postsService.getPosts(this.orden(), this.offset, this.limit).subscribe({
      next: (list) => {
        if (initial) {
          this.posts.set(list);
        } else {
          this.posts.update((prev) => [...prev, ...list]);
        }

        // Si vienen menos de limit → no hay más
        if (list.length < this.limit) this.noMorePosts.set(true);

        this.offset += this.limit;
      },
      error: () => {
        this.alerts.error('Error al cargar publicaciones');
      },
      complete: () => {
        this.loading.set(false);
        this.loadingMore.set(false);
      },
    });
  }

  /** Manejar like/unlike */
  toggleLike(post: PostUI) {
    if (post.likedByMe) this.unlikePost(post);
    else this.likePost(post);
  }

  likePost(post: PostUI) {
    this.postsService.like(post._id).subscribe({
      next: (res) => {
        this.posts.update((list) =>
          list.map((p) =>
            p._id === post._id ? { ...p, likedByMe: true, likesCount: res.totalLikes } : p
          )
        );
      },
      error: () => {
        this.alerts.error('Error al dar me gusta');
      },
    });
  }

  unlikePost(post: PostUI) {
    this.postsService.unlike(post._id).subscribe({
      next: (res) => {
        this.posts.update((list) =>
          list.map((p) =>
            p._id === post._id ? { ...p, likedByMe: false, likesCount: res.totalLikes } : p
          )
        );
      },
      error: () => {
        this.alerts.error('Error al quitar me gusta');
      },
    });
  }

  /** Eliminar publicación */
  deletePost(post: PostUI) {
    this.postsService.delete(post._id).subscribe({
      next: () => {
        this.posts.update((list) => list.filter((p) => p._id !== post._id));
        this.alerts.success('Publicación eliminada');
      },
      error: () => {
        this.alerts.error('No se pudo eliminar la publicación');
      },
    });
  }

  /** Cambiar orden (fecha / likes) */
  changeOrder(orden: 'fecha' | 'likes') {
    if (orden === this.orden()) return;
    this.orden.set(orden);
    this.loadPosts(true); // recargar lista
  }
}
