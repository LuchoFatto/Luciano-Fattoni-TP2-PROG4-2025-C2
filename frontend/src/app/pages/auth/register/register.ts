import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
import {
  ImageUploaderComponent,
  ButtonComponent,
  FormFieldComponent,
  InputComponent,
  TextareaComponent,
  CardComponent,
} from '../../../shared/ui';
import {
  matchFieldsValidator,
  strongPasswordValidator,
  onlyLettersValidator,
  minimumAgeValidator,
} from '../../../shared/validators/custom-validators';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register',
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
    RouterLink
],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private alert = inject(AlertService);
  private router = inject(Router);

  loading = false;
  imageFile: File | null = null;

  // =================== Formulario reactivo ===================
  form = this.fb.group(
    {
      nombre: this.fb.control('', {
        validators: [Validators.required, onlyLettersValidator()],
      }),
      apellido: this.fb.control('', {
        validators: [Validators.required, onlyLettersValidator()],
      }),
      correo: this.fb.control('', {
        validators: [Validators.required, Validators.email],
      }),
      nombreUsuario: this.fb.control('', {
        validators: [Validators.required],
      }),
      password: this.fb.control('', {
        validators: [Validators.required, strongPasswordValidator()],
      }),
      repetirContraseña: this.fb.control('', {
        validators: [Validators.required],
      }),
      fechaNacimiento: this.fb.control('', {
        validators: [minimumAgeValidator(13)],
      }),
      descripcion: this.fb.control(''),
    },
    { validators: matchFieldsValidator('password', 'repetirContraseña') }
  );

  // =================== Métodos ===================

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

      Object.entries(this.form.value).forEach(([key, value]) => {
        if (key !== 'repetirContraseña' && value !== null && value !== undefined) {
          formData.append(key, value as string);
        }
      });

      if (this.imageFile) {
        formData.append('imagenPerfil', this.imageFile);
      }

      await firstValueFrom(this.auth.register(formData));

      this.alert.success('Registro exitoso');
      this.router.navigate(['/login']);
    } catch (err: any) {
      this.alert.error(err?.error?.message || 'Error al registrarse');
    } finally {
      this.loading = false;
    }
  }
}
