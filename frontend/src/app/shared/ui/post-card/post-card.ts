import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostUI } from '../../../services/posts.service';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { RelativeTimePipe, TruncatePipe } from '../../pipes';

@Component({
  selector: 'ui-post-card',
  standalone: true,
  imports: [CommonModule, RelativeTimePipe, TruncatePipe],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCardComponent {
  @Input({ required: true }) post!: PostUI;

  @Output() like = new EventEmitter<string>();
  @Output() unlike = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  @Output() open = new EventEmitter<void>();
  @Output() comment = new EventEmitter<void>();

  private alerts = inject(AlertService);
  private auth = inject(AuthService);

  /** Verifica si el usuario actual es administrador */
  get isAdmin(): boolean {
    const user = this.auth.currentUser();
    return user?.perfil === 'administrador';
  }

  /** Verifica si se debe mostrar el botón eliminar */
  get canDelete(): boolean {
    return this.post.isMine || this.isAdmin;
  }

  /** Fecha tipo "hace X min" */
  get timeAgo(): string {
    const date = new Date(this.post.createdAt);
    const diffMs = Date.now() - date.getTime();

    const sec = diffMs / 1000;
    const min = sec / 60;
    const hr = min / 60;
    const day = hr / 24;

    if (sec < 60) return 'hace un momento';
    if (min < 60) return `hace ${Math.floor(min)} min`;
    if (hr < 24) return `hace ${Math.floor(hr)} h`;
    return `hace ${Math.floor(day)} días`;
  }

  /** Abrir publicación (card clickeada) */
  onOpen() {
    this.open.emit();
  }

  /** Click en like: que no navegue */
  onLikeClick(event: MouseEvent) {
    event.stopPropagation();
    this.toggleLike();
  }

  /** Click en comentarios: que no navegue */
  onCommentClick(event: MouseEvent) {
    event.stopPropagation();
    this.comment.emit();
  }

  /** Like / unlike */
  private toggleLike() {
    if (this.post.likedByMe) {
      this.unlike.emit(this.post._id);
    } else {
      this.like.emit(this.post._id);
    }
  }

  /** Click en eliminar: que no navegue */
  async onDeleteClick(event: MouseEvent) {
    event.stopPropagation();
    await this.confirmDelete();
  }

  /** Confirmación elegante para borrar */
  private async confirmDelete() {
    const res = await this.alerts.confirmDanger(
      'Eliminar publicación',
      '¿Seguro que querés eliminar esta publicación?',
      'Sí, borrar',
      'Cancelar'
    );

    if (res) {
      this.delete.emit(this.post._id);
    }
  }
}
