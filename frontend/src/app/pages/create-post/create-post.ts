import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import {
  ImageUploaderComponent,
  ButtonComponent,
  FormFieldComponent,
  InputComponent,
  TextareaComponent,
  CardComponent,
} from '../../shared/ui';

import { PostsService } from '../../services/posts.service';
import { AlertService } from '../../services/alert.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ImageUploaderComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    TextareaComponent,
    CardComponent,
  ],
  templateUrl: './create-post.html',
  styleUrls: ['./create-post.css'],
})
export class CreatePost {
  private fb = inject(FormBuilder);
  private postsService = inject(PostsService);
  private alert = inject(AlertService);
  private router = inject(Router);

  loading = false;
  imageFile: File | null = null;

  // ====== Formulario ======
  form = this.fb.group({
    titulo: this.fb.control('', {
      validators: [Validators.required, Validators.minLength(3)],
    }),
    descripcion: this.fb.control('', {
      validators: [Validators.required, Validators.minLength(5)],
    }),
  });

  // ====== Métodos ======

  onFileSelected(file: File | null) {
    this.imageFile = file;
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.alert.warning('Revisa los campos antes de continuar');
      return;
    }

    this.loading = true;

    try {
      const formData = new FormData();
      const { titulo, descripcion } = this.form.value;

      formData.append('titulo', titulo as string);
      formData.append('descripcion', descripcion as string);

      // El backend espera el archivo bajo el nombre "imagen"
      if (this.imageFile) {
        formData.append('imagen', this.imageFile);
      }

      await firstValueFrom(this.postsService.createPost(formData));

      this.alert.success('Publicación creada correctamente');
      this.router.navigate(['/posts']);
    } catch (err: any) {
      console.error(err);
      this.alert.error(err?.error?.message || 'No se pudo crear la publicación');
    } finally {
      this.loading = false;
    }
  }
}
