import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UsersService } from '../../../services/users.service';
import { AlertService } from '../../../services/alert.service';
import { LoadingService } from '../../../services/loading.service';
import { User } from '../../../services/auth.service';
import { TooltipDirective } from '../../../shared/directives';
import {
  CardComponent,
  FormFieldComponent,
  InputComponent,
  ButtonComponent,
  ImageUploaderComponent,
} from '../../../shared/ui';
import {
  strongPasswordValidator,
  onlyLettersValidator,
} from '../../../shared/validators/custom-validators';
import { firstValueFrom } from 'rxjs';

/**
 * Página de gestión de usuarios (solo admins)
 * Permite listar, crear, habilitar y deshabilitar usuarios
 */
@Component({
  selector: 'app-users',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    FormFieldComponent,
    InputComponent,
    ButtonComponent,
    ImageUploaderComponent,
    TooltipDirective,
  ],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  private usersService = inject(UsersService);
  private alert = inject(AlertService);
  private loading = inject(LoadingService);
  private fb = inject(FormBuilder);

  // Estado
  usuarios = signal<User[]>([]);
  showForm = signal(false);
  imageFile: File | null = null;

  // Formulario
  userForm = this.fb.group({
    nombre: this.fb.control('', [Validators.required, onlyLettersValidator()]),
    apellido: this.fb.control('', [Validators.required, onlyLettersValidator()]),
    correo: this.fb.control('', [Validators.required, Validators.email]),
    nombreUsuario: this.fb.control('', [Validators.required]),
    password: this.fb.control('', [Validators.required, strongPasswordValidator()]),
    perfil: this.fb.control('usuario', [Validators.required]),
    fechaNacimiento: this.fb.control(''),
    descripcion: this.fb.control(''),
  });

  ngOnInit() {
    this.loadUsers();
  }

  /**
   * Carga la lista de usuarios
   */
  async loadUsers() {
    try {
      const res = await this.loading.wrap(() => firstValueFrom(this.usersService.getAll()));
      this.usuarios.set(res.usuarios);
    } catch (err: any) {
      this.alert.error(err?.error?.message || 'Error al cargar usuarios');
    }
  }

  /**
   * Alterna la visibilidad del formulario
   */
  toggleForm() {
    this.showForm.update((v) => !v);
    if (!this.showForm()) {
      this.userForm.reset({ perfil: 'usuario' });
      this.imageFile = null;
    }
  }

  /**
   * Maneja la selección de imagen
   */
  onFileSelected(file: File | null) {
    this.imageFile = file;
  }

  /**
   * Crea un nuevo usuario
   */
  async onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.alert.warning('Por favor, completá todos los campos correctamente');
      return;
    }

    try {
      const formData = new FormData();

      Object.entries(this.userForm.value).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value as string);
        }
      });

      if (this.imageFile) {
        formData.append('imagenPerfil', this.imageFile);
      }

      await this.loading.wrap(() => firstValueFrom(this.usersService.create(formData)));

      this.alert.success('Usuario creado correctamente');
      this.toggleForm();
      this.loadUsers();
    } catch (err: any) {
      this.alert.error(err?.error?.message || 'Error al crear usuario');
    }
  }

  /**
   * Deshabilita un usuario
   */
  async disableUser(user: User) {
    const confirmed = await this.alert.confirmDanger(
      'Deshabilitar usuario',
      `¿Seguro que querés deshabilitar a ${user.nombreUsuario}? No podrá iniciar sesión.`,
      'Sí, deshabilitar',
      'Cancelar'
    );

    if (!confirmed) return;

    try {
      await this.loading.wrap(() => firstValueFrom(this.usersService.disable(user._id)));
      this.alert.success(`Usuario ${user.nombreUsuario} deshabilitado`);
      this.loadUsers();
    } catch (err: any) {
      this.alert.error(err?.error?.message || 'Error al deshabilitar usuario');
    }
  }

  /**
   * Habilita un usuario
   */
  async enableUser(user: User) {
    try {
      await this.loading.wrap(() => firstValueFrom(this.usersService.enable(user._id)));
      this.alert.success(`Usuario ${user.nombreUsuario} habilitado`);
      this.loadUsers();
    } catch (err: any) {
      this.alert.error(err?.error?.message || 'Error al habilitar usuario');
    }
  }
}
