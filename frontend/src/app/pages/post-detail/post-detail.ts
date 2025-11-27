import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

// Services
import { PostsService, PostUI } from '../../services/posts.service';
import { CommentsService, CommentUI } from '../../services/comments.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { LoadingService } from '../../services/loading.service';

// Components
import { TextareaComponent, SpinnerComponent, AvatarComponent } from '../../shared/ui';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextareaComponent,
    SpinnerComponent,
    AvatarComponent,
  ],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.css',
})
export class PostDetail implements OnInit {
  // Inject services
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private postsService = inject(PostsService);
  private commentsService = inject(CommentsService);
  private auth = inject(AuthService);
  private alerts = inject(AlertService);
  private loading = inject(LoadingService);

  // ====== STATE ======
  post = signal<PostUI | null>(null);
  comments = signal<CommentUI[]>([]);
  loadingPost = signal(true);
  loadingComments = signal(false);
  loadingMore = signal(false);
  noMoreComments = signal(false);

  // Paginación
  private readonly COMMENTS_LIMIT = 10;
  private commentsOffset = 0;

  // Usuario actual
  currentUser = computed(() => this.auth.currentUser());

  // Edición de comentarios
  editingCommentId = signal<string | null>(null);
  editForm = this.fb.group({
    mensaje: ['', [Validators.required, Validators.minLength(1)]],
  });

  // Formulario nuevo comentario
  commentForm = this.fb.group({
    mensaje: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(500)]],
  });

  ngOnInit() {
    this.loadPost();
  }

  // ========================================
  //  CARGAR POST
  // ========================================
  private async loadPost() {
    const postId = this.route.snapshot.paramMap.get('id');
    if (!postId) {
      this.alerts.error('ID de publicación no válido');
      this.router.navigate(['/posts']);
      return;
    }

    // Intentar obtener el post del state (si viene de navegación desde /posts o /perfil)
    const navigationState = history.state;
    if (navigationState?.post) {
      this.post.set(navigationState.post);
      this.loadingPost.set(false);
      this.loadComments(postId);
      return;
    }

    // Si no está en el state, cargar desde el backend
    try {
      await this.loading.wrap(async () => {
        const postData = await firstValueFrom(this.postsService.getById(postId));
        this.post.set(postData);
      });
      this.loadComments(postId);
    } catch (error) {
      this.alerts.error('No se pudo cargar la publicación');
      this.router.navigate(['/posts']);
    } finally {
      this.loadingPost.set(false);
    }
  }

  // ========================================
  //  CARGAR COMENTARIOS (inicial)
  // ========================================
  private async loadComments(postId: string) {
    this.loadingComments.set(true);
    this.commentsOffset = 0;
    this.noMoreComments.set(false);

    try {
      const data = await firstValueFrom(
        this.commentsService.getComments(postId, this.COMMENTS_LIMIT, this.commentsOffset)
      );

      this.comments.set(data);
      this.commentsOffset += this.COMMENTS_LIMIT;

      if (data.length < this.COMMENTS_LIMIT) {
        this.noMoreComments.set(true);
      }
    } catch (error) {
      this.alerts.error('Error al cargar comentarios');
    } finally {
      this.loadingComments.set(false);
    }
  }

  // ========================================
  //  CARGAR MÁS COMENTARIOS
  // ========================================
  async loadMoreComments() {
    const postId = this.post()?._id;
    if (!postId || this.loadingMore() || this.noMoreComments()) return;

    this.loadingMore.set(true);

    try {
      const data = await firstValueFrom(
        this.commentsService.getComments(postId, this.COMMENTS_LIMIT, this.commentsOffset)
      );

      this.comments.update((prev) => [...prev, ...data]);
      this.commentsOffset += this.COMMENTS_LIMIT;

      if (data.length < this.COMMENTS_LIMIT) {
        this.noMoreComments.set(true);
      }
    } catch (error) {
      this.alerts.error('Error al cargar más comentarios');
    } finally {
      this.loadingMore.set(false);
    }
  }

  // ========================================
  //  CREAR COMENTARIO
  // ========================================
  async onSubmitComment() {
    if (this.commentForm.invalid) {
      this.alerts.warning('Por favor, escribe un comentario válido');
      this.commentForm.markAllAsTouched();
      return;
    }

    const postId = this.post()?._id;
    if (!postId) return;

    const mensaje = this.commentForm.value.mensaje!.trim();

    try {
      const newComment = await firstValueFrom(this.commentsService.createComment(postId, mensaje));

      // Agregar el nuevo comentario al inicio (más reciente primero)
      this.comments.update((prev) => [newComment, ...prev]);
      this.commentForm.reset();
      this.alerts.success('Comentario publicado');
    } catch (error) {
      this.alerts.error('Error al publicar comentario');
    }
  }

  // ========================================
  //  EDITAR COMENTARIO
  // ========================================
  startEditing(comment: CommentUI) {
    this.editingCommentId.set(comment._id);
    this.editForm.patchValue({ mensaje: comment.mensaje });
  }

  cancelEditing() {
    this.editingCommentId.set(null);
    this.editForm.reset();
  }

  async saveEdit(commentId: string) {
    if (this.editForm.invalid) {
      this.alerts.warning('El comentario no puede estar vacío');
      return;
    }

    const mensaje = this.editForm.value.mensaje!.trim();

    try {
      const updated = await firstValueFrom(this.commentsService.updateComment(commentId, mensaje));

      // Actualizar en la lista
      this.comments.update((prev) => prev.map((c) => (c._id === commentId ? { ...updated } : c)));

      this.editingCommentId.set(null);
      this.alerts.success('Comentario actualizado');
    } catch (error) {
      this.alerts.error('Error al actualizar comentario');
    }
  }

  // ========================================
  //  ELIMINAR COMENTARIO
  // ========================================
  async deleteComment(commentId: string) {
    const confirmed = confirm('¿Estás seguro de eliminar este comentario?');
    if (!confirmed) return;

    try {
      await firstValueFrom(this.commentsService.deleteComment(commentId));

      this.comments.update((prev) => prev.filter((c) => c._id !== commentId));
      this.alerts.success('Comentario eliminado');
    } catch (error) {
      this.alerts.error('Error al eliminar comentario');
    }
  }

  // ========================================
  //  LIKE/UNLIKE POST
  // ========================================
  async toggleLike() {
    const currentPost = this.post();
    if (!currentPost) return;

    if (currentPost.likedByMe) {
      await this.unlikePost(currentPost._id);
    } else {
      await this.likePost(currentPost._id);
    }
  }

  private async likePost(postId: string) {
    try {
      const res = await firstValueFrom(this.postsService.like(postId));
      this.post.update((p) => (p ? { ...p, likedByMe: true, likesCount: res.totalLikes } : p));
    } catch (error) {
      this.alerts.error('Error al dar me gusta');
    }
  }

  private async unlikePost(postId: string) {
    try {
      const res = await firstValueFrom(this.postsService.unlike(postId));
      this.post.update((p) => (p ? { ...p, likedByMe: false, likesCount: res.totalLikes } : p));
    } catch (error) {
      this.alerts.error('Error al quitar me gusta');
    }
  }

  // ========================================
  //  HELPERS
  // ========================================
  isCommentAuthor(comment: CommentUI): boolean {
    return comment.autor._id === this.currentUser()?._id;
  }

  goBack() {
    // Usar navigation para volver a la página anterior (perfil o posts)
    window.history.back();
  }
}
