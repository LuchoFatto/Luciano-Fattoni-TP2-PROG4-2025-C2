import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import {
  NavbarComponent,
  CardComponent,
  FormFieldComponent,
  InputComponent,
  ButtonComponent,
} from '../../../shared/ui';
import { strongPasswordValidator } from '../../../shared/validators/custom-validators';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CardComponent,
    FormFieldComponent,
    InputComponent,
    ButtonComponent,
    ReactiveFormsModule,
    RouterLink
],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private alert = inject(AlertService);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;

  // Form
  form = this.fb.group({
    identifier: this.fb.control('', {
      validators: [Validators.required],
    }),
    password: this.fb.control('', {
      validators: [Validators.required, strongPasswordValidator()],
    }),
  });

  async onSubmit(event: Event) {
    event.preventDefault();

    if (this.form.invalid) {
      this.alert.warning('Por favor, completá todos los campos correctamente');
      this.form.markAllAsTouched();
      return;
    }

    const { identifier, password } = this.form.value;
    this.loading = true;

    try {
      const res = await firstValueFrom(this.auth.login(String(identifier), String(password)));

      this.auth.setSession(res.token, res.usuario);
      this.alert.success('¡Bienvenido a Click!');
      this.router.navigateByUrl('/posts');
    } catch (err: any) {
      const msg = err?.error?.message || 'Credenciales inválidas';
      this.alert.error(msg);
    } finally {
      this.loading = false;
    }
  }
}
