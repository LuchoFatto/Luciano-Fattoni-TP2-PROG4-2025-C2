import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostUI } from '../../../services/posts.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'ui-post-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCardComponent {
  @Input({ required: true }) post!: PostUI;

  @Output() like = new EventEmitter<string>();
  @Output() unlike = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  private alerts = inject(AlertService);

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

  /** Like / unlike */
  toggleLike() {
    if (this.post.likedByMe) {
      this.unlike.emit(this.post._id);
    } else {
      this.like.emit(this.post._id);
    }
  }

  /** Confirmación elegante para borrar */
  async confirmDelete() {
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
