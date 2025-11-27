import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { ProfileService, ProfileData } from '../../services/profile.service';
import { PostsService, PostUI } from '../../services/posts.service';
import { AuthService } from '../../services/auth.service';

import {
  UiProfileComponent,
  SpinnerComponent,
  ImageUploaderComponent,
  InputComponent,
} from '../../shared/ui';
import { LoadingService } from '../../services/loading.service';
import { firstValueFrom } from 'rxjs';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UiProfileComponent,
    SpinnerComponent,
    ImageUploaderComponent,
    InputComponent,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private profileService = inject(ProfileService);
  private postsService = inject(PostsService);
  private authService = inject(AuthService);
  private alerts = inject(AlertService);
  private loadingOverlay = inject(LoadingService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // ==== Signals ====
  profile = signal<ProfileData | null>(null);
  lastPosts = signal<PostUI[]>([]);
  allPosts = signal<PostUI[]>([]);
  postsCount = signal<number>(0);

  loadingPosts = signal(true);
  showEditModal = signal(false);
  editImageFile = signal<File | null>(null);
  editImagePreview = signal<string | null>(null);

  // Formulario de edición
  editForm = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    descripcion: [''],
    fechaNacimiento: [''],
  });

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
    const current = this.profile();
    if (!current) return;

    // Llenar formulario con datos actuales
    this.editForm.patchValue({
      nombre: current.nombre,
      apellido: current.apellido,
      descripcion: current.descripcion || '',
      fechaNacimiento: current.fechaNacimiento || '',
    });

    // Resetear imagen
    this.editImageFile.set(null);
    this.editImagePreview.set(current.imagenPerfil || null);

    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.editForm.reset();
    this.editImageFile.set(null);
    this.editImagePreview.set(null);
  }

  onImageChange(file: File | null) {
    this.editImageFile.set(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.editImagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      this.editImagePreview.set(this.profile()?.imagenPerfil || null);
    }
  }

  async onSubmitEdit() {
    if (this.editForm.invalid) {
      this.alerts.warning('Por favor completa los campos requeridos');
      this.editForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('nombre', this.editForm.value.nombre!);
    formData.append('apellido', this.editForm.value.apellido!);
    formData.append('descripcion', this.editForm.value.descripcion || '');
    formData.append('fechaNacimiento', this.editForm.value.fechaNacimiento || '');

    if (this.editImageFile()) {
      formData.append('imagenPerfil', this.editImageFile()!);
    }

    try {
      await this.loadingOverlay.wrap(async () => {
        const response = await firstValueFrom(this.profileService.updateProfile(formData));

        // Actualizar usuario en AuthService (con los campos faltantes)
        const currentUser = this.authService.currentUser()!;
        this.authService.setSession(this.authService.getToken()!, {
          ...currentUser,
          ...response.usuario,
        });

        // Actualizar perfil local
        this.profile.set(response.usuario);

        this.closeEditModal();
        this.alerts.success('Perfil actualizado correctamente');
      });
    } catch (error: any) {
      this.alerts.error(error?.error?.message || 'Error al actualizar perfil');
    }
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
