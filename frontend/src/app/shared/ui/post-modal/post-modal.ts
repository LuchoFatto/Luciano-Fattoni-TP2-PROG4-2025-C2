import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostUI } from '../../../services/posts.service';

@Component({
  selector: 'ui-post-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-modal.html',
  styleUrl: './post-modal.css',
})
export class PostModalComponent {
  @Input({ required: true }) post!: PostUI;

  @Output() closed = new EventEmitter<void>();
  @Output() like = new EventEmitter<string>();
  @Output() unlike = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  closeModal() {
    this.closed.emit();
  }

  toggleLike() {
    if (this.post.likedByMe) this.unlike.emit(this.post._id);
    else this.like.emit(this.post._id);
  }

  onDelete() {
    this.delete.emit(this.post._id);
  }
}
