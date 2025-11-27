import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ProfileService, ProfileData } from '../../services/profile.service';
import { PostsService, PostUI } from '../../services/posts.service';

import { UiProfileComponent, SpinnerComponent } from '../../shared/ui';
import { LoadingService } from '../../services/loading.service';
import { firstValueFrom } from 'rxjs';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, UiProfileComponent, SpinnerComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private profileService = inject(ProfileService);
  private postsService = inject(PostsService);
  private alerts = inject(AlertService);
  private loadingOverlay = inject(LoadingService);
  private router = inject(Router);

  // ==== Signals ====
  profile = signal<ProfileData | null>(null);
  lastPosts = signal<PostUI[]>([]);
  allPosts = signal<PostUI[]>([]);
  postsCount = signal<number>(0);

  loadingPosts = signal(true);

  constructor() {
    this.loadProfile();
  }

  /** Carga datos del usuario + posts + conteo */
  async loadProfile() {
    // ------- PERFIL (usa overlay) -------
    await this.loadingOverlay.wrap(async () => {
      const data = this.profileService.getMyProfile();
      this.profile.set(data);
    }, 'Cargando perfil...');

    const data = this.profile();
    if (!data) return;

    // ------- Últimas 3 publicaciones -------
    this.profileService.getMyLastPosts(3).subscribe({
      next: (posts) => this.lastPosts.set(posts),
    });

    // ------- Cantidad total -------
    this.profileService.getMyPostsCount().subscribe({
      next: (count) => this.postsCount.set(count),
    });

    // ------- Todas las publicaciones (grilla) -------
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

  /** Abrir publicación en vista detalle (estilo Instagram) */
  openPost(post: PostUI) {
    this.router.navigate(['/posts', post._id], {
      state: { post },
    });
  }

  async onDelete(id: string) {
    try {
      await this.loadingOverlay.wrap(async () => {
        await firstValueFrom(this.postsService.delete(id));
      });

      // Actualizar grilla
      this.allPosts.update((list) => list.filter((p) => p._id !== id));

      // Actualizar contador
      this.postsCount.update((n) => n - 1);

      this.alerts.success('Publicación eliminada');
    } catch {
      this.alerts.error('No se pudo eliminar la publicación');
    }
  }
}
