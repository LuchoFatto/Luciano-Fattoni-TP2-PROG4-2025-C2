import { Component, effect, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/ui/navbar/navbar';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent, RouterOutlet],
  templateUrl: './app.html',
})
export class AppComponent {
  constructor(private auth: AuthService, private router: Router) {}

  // Signals para el navbar
  username = signal<string>('Invitado');
  avatarUrl = signal<string | null>(null);
  navLinks = signal<{ label: string }[]>([]);
  navDropdown = signal<({ label: string; divider?: false } | { divider: true })[]>([]);

  ngOnInit() {
    effect(() => {
      const user = this.auth.currentUser();

      if (user) {
        // ===== Usuario logueado =====
        this.username.set(user.nombreUsuario);
        this.avatarUrl.set(user.imagenPerfil || null);

        this.navLinks.set([
          { label: 'Inicio' },
          { label: 'Publicaciones' },
          { label: 'Mi Perfil' },
        ]);

        this.navDropdown.set([
          { label: 'Configuración' },
          { divider: true },
          { label: 'Cerrar sesión' },
        ]);
      } else {
        // ===== Usuario no logueado =====
        this.username.set('Invitado');
        this.avatarUrl.set(null);

        this.navLinks.set([]);
        this.navDropdown.set([]);
      }
    });
  }

  goHome() {
    if (this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/posts');
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  onDropdownClick(item: any) {
    if (item.label === 'Cerrar sesión') {
      this.auth.clearSession();
      this.router.navigateByUrl('/login');
    }
  }
}
