import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileService, ProfileData } from '../../services/profile.service';
import { PostsService, PostUI } from '../../services/posts.service';

import { UiProfileComponent, PostModalComponent } from '../../shared/ui';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, UiProfileComponent, PostModalComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private profileService = inject(ProfileService);
  private postsService = inject(PostsService);

  // ==== Signals ====
  profile = signal<ProfileData | null>(null);
  lastPosts = signal<PostUI[]>([]);
  allPosts = signal<PostUI[]>([]);
  postsCount = signal<number>(0);
  selectedPost = signal<PostUI | null>(null);

  loadingProfile = signal(true);
  loadingPosts = signal(true);
  loadingCount = signal(true);

  constructor() {
    this.loadProfile();
  }

  /** Carga datos del usuario + posts + conteo */
  loadProfile() {
    const data = this.profileService.getMyProfile();
    this.profile.set(data);
    this.loadingProfile.set(false);

    if (!data) return;

    // Últimas 3 publicaciones
    this.profileService.getMyLastPosts(3).subscribe({
      next: (posts) => {
        this.lastPosts.set(posts);
      },
      error: () => {},
    });

    // Cantidad total
    this.profileService.getMyPostsCount().subscribe({
      next: (count) => {
        this.postsCount.set(count);
      },
      error: () => {},
    });

    // Todas las publicaciones (GRILLA)
    this.profileService.getMyAllPosts().subscribe({
      next: (posts) => {
        this.allPosts.set(posts);
        this.loadingPosts.set(false);
      },
      error: () => this.loadingPosts.set(false),
    });
  }

  editProfile() {
    console.log('Editar perfil próximamente...');
  }

  openPost(post: PostUI) {
    this.selectedPost.set(post);
  }

  closeModal() {
    this.selectedPost.set(null);
  }

  onLike(id: string) {
    this.postsService.like(id).subscribe({
      next: (res) => {
        // modal
        const post = this.selectedPost();
        if (post && post._id === id) {
          this.selectedPost.set({ ...post, likesCount: res.totalLikes, likedByMe: true });
        }

        // grilla
        this.allPosts.update((list) =>
          list.map((p) =>
            p._id === id ? { ...p, likesCount: res.totalLikes, likedByMe: true } : p
          )
        );
      },
    });
  }

  onUnlike(id: string) {
    this.postsService.unlike(id).subscribe({
      next: (res) => {
        const post = this.selectedPost();
        if (post && post._id === id) {
          this.selectedPost.set({ ...post, likesCount: res.totalLikes, likedByMe: false });
        }

        this.allPosts.update((list) =>
          list.map((p) =>
            p._id === id ? { ...p, likesCount: res.totalLikes, likedByMe: false } : p
          )
        );
      },
    });
  }

  onDelete(id: string) {
    this.postsService.delete(id).subscribe({
      next: () => {
        this.allPosts.update((list) => list.filter((p) => p._id !== id));
        this.postsCount.update((n) => n - 1);
        this.closeModal();
      },
    });
  }
}
