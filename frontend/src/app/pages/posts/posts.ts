import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostsService, PostUI } from '../../services/posts.service';
import { AlertService } from '../../services/alert.service';
import { PostCardComponent, SpinnerComponent } from '../../shared/ui';
import { LoadingService } from '../../services/loading.service';
import { HighlightPipe } from '../../shared/pipes';
import { AutofocusDirective } from '../../shared/directives';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, PostCardComponent, SpinnerComponent, HighlightPipe, AutofocusDirective],
  templateUrl: './posts.html',
  styleUrl: './posts.css',
})
export class Posts {
  private postsService = inject(PostsService);
  private alerts = inject(AlertService);
  private loadingOverlay = inject(LoadingService);
  private router = inject(Router);

  // ====== STATE ======
  posts = signal<PostUI[]>([]);
  loadingMore = signal(false);
  orden = signal<'fecha' | 'likes'>('fecha');
  searchTerm = signal<string>('');

  // Posts filtrados por búsqueda
  filteredPosts = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    if (!search) return this.posts();

    return this.posts().filter(
      (post) =>
        post.titulo.toLowerCase().includes(search) ||
        post.descripcion.toLowerCase().includes(search) ||
        post.autor.nombreUsuario.toLowerCase().includes(search)
    );
  });

  // Parámetros de paginación
  limit = 5;
  offset = 0;
  noMorePosts = signal(false);

  constructor() {
    this.loadPosts(true);
  }

  /** Cargar publicaciones (inicial o "load more") */
  async loadPosts(initial = false) {
    if (initial) {
      this.offset = 0;
      this.noMorePosts.set(false);
      this.posts.set([]);

      await this.loadingOverlay
        .wrap(async () => {
          const list = await firstValueFrom(
            this.postsService.getPosts(this.orden(), this.offset, this.limit)
          );

          this.posts.set(list);
          if (list.length < this.limit) this.noMorePosts.set(true);
          this.offset += this.limit;
        })
        .catch(() => {
          this.alerts.error('Error al cargar publicaciones');
        });

      return;
    }

    // ===== LOAD MORE =====
    this.loadingMore.set(true);

    this.postsService.getPosts(this.orden(), this.offset, this.limit).subscribe({
      next: (list) => {
        this.posts.update((prev) => [...prev, ...list]);

        if (list.length < this.limit) this.noMorePosts.set(true);

        this.offset += this.limit;
      },
      error: () => {
        this.alerts.error('Error al cargar publicaciones');
      },
      complete: () => {
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
  async deletePost(post: PostUI) {
    try {
      await this.loadingOverlay.wrap(async () => {
        await firstValueFrom(this.postsService.delete(post._id));
      });

      this.posts.update((list) => list.filter((p) => p._id !== post._id));
      this.alerts.success('Publicación eliminada');
    } catch {
      this.alerts.error('No se pudo eliminar la publicación');
    }
  }

  /** Ir a la página de la publicación (vista grande + comentarios) */
  openPost(post: PostUI) {
    this.router.navigate(['/posts', post._id], {
      state: { post },
    });
  }

  /** Cambiar orden (fecha / likes) */
  changeOrder(orden: 'fecha' | 'likes') {
    if (orden === this.orden()) return;
    this.orden.set(orden);
    this.loadPosts(true); // recargar lista
  }

  /** Actualizar término de búsqueda */
  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  /** Limpiar búsqueda */
  clearSearch() {
    this.searchTerm.set('');
  }
}
