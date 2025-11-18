import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileData } from '../../../services/profile.service';
import { PostUI } from '../../../services/posts.service';

@Component({
  selector: 'ui-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class UiProfileComponent {
  @Input() profile!: ProfileData;
  @Input() postsCount: number = 0;
  @Input() lastPosts: PostUI[] = [];

  @Output() edit = new EventEmitter<void>();

  onEditClick() {
    this.edit.emit();
  }
}
