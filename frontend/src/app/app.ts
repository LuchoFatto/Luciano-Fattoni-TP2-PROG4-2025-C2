import { Component, effect, signal, inject, computed } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/ui/navbar/navbar';
import { AuthService } from './services/auth.service';
import { LoadingOverlayComponent } from './shared/ui/loading-overlay/loading-overlay';
import { LoadingService } from './services/loading.service';
import { SessionTimerService } from './services/session-timer.service';
import { SessionWarningModalComponent } from './shared/ui';
import { AlertService } from './services/alert.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent, RouterOutlet, LoadingOverlayComponent, SessionWarningModalComponent],
  templateUrl: './app.html',
})
export class AppComponent {
  private router = inject(Router);
  private auth = inject(AuthService);
  private loading = inject(LoadingService);
  private sessionTimer = inject(SessionTimerService);
  private alert = inject(AlertService);

  // Signals
  username = signal<string>('Invitado');
  avatarUrl = signal<string | null>(null);
  navLinks = signal<{ label: string }[]>([]);
  navDropdown = signal<({ label: string; divider?: false } | { divider: true })[]>([]);

  // Modal de sesión
  showSessionWarning = signal<boolean>(false);
  timeRemaining = signal<number>(0);

  // Tiempo formateado para el modal
  formattedTime = computed(() => {
    const seconds = this.timeRemaining();
    if (seconds <= 0) return '00:00';

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  });

  constructor() {
    // Actualizar navbar según usuario
    effect(() => {
      const user = this.auth.currentUser();

      if (user) {
        this.username.set(user.nombreUsuario);
        this.avatarUrl.set(user.imagenPerfil || null);

        this.navLinks.set([
          { label: 'Publicaciones' },
          { label: 'Crear publicación' },
          { label: 'Mi Perfil' },
        ]);

        const dropdownItems: ({ label: string; divider?: false } | { divider: true })[] = [];

        if (user.perfil === 'administrador') {
          dropdownItems.push({ label: 'Dashboard' });
          dropdownItems.push({ label: 'Estadísticas' });
          dropdownItems.push({ divider: true });
        }

        dropdownItems.push({ label: 'Cerrar sesión' });

        this.navDropdown.set(dropdownItems);
      } else {
        this.username.set('Invitado');
        this.avatarUrl.set(null);
        this.navLinks.set([]);
        this.navDropdown.set([]);
      }
    });

    // Suscripción al warning del timer de sesión
    this.sessionTimer.warningTriggered$.subscribe(() => {
      this.showSessionWarning.set(true);
    });

    // Observar cambios en el tiempo restante
    effect(() => {
      this.timeRemaining.set(this.sessionTimer.timeRemaining());
    });

    // Cerrar sesión automáticamente cuando llegue a 0
    effect(() => {
      const remaining = this.timeRemaining();

      if (remaining === 0 && this.showSessionWarning()) {
        // Tiempo agotado - cerrar sesión automáticamente
        this.alert.warning('Tu sesión ha expirado');
        this.onLogoutFromModal();
      }
    });
  }

  ngOnInit() {
    this.initialize();
  }

  async initialize() {
    const token = this.auth.getToken();
    if (!token) return;

    await this.loading
      .wrap(() => firstValueFrom(this.auth.authorize()))
      .then((res) => {
        this.auth.setSession(token, res.usuario);
        this.sessionTimer.start(); // Iniciar timer al recargar con sesión activa
        this.router.navigate(['/posts']);
      })
      .catch(() => {
        this.auth.clearSession();
        this.router.navigate(['/login']);
      });
  }

  goHome() {
    if (this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/posts');
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  onNavLinkClick(link: any) {
    switch (link.label) {
      case 'Publicaciones':
        this.router.navigateByUrl('/posts');
        break;

      case 'Crear publicación':
        this.router.navigateByUrl('/crear');
        break;

      case 'Mi Perfil':
        this.router.navigateByUrl('/perfil');
        break;
    }
  }

  onDropdownClick(item: any) {
    switch (item.label) {
      case 'Dashboard':
        this.router.navigateByUrl('/dashboard/usuarios');
        break;

      case 'Estadísticas':
        this.router.navigateByUrl('/dashboard/estadisticas');
        break;

      case 'Cerrar sesión':
        this.handleLogout();
        break;
    }
  }

  /**
   * Maneja el cierre de sesión con confirmación
   */
  async handleLogout() {
    const confirmed = await this.alert.confirm(
      '¿Cerrar sesión?',
      'Estás a punto de cerrar tu sesión. ¿Deseas continuar?',
      'Sí, cerrar sesión',
      'Cancelar'
    );

    if (confirmed) {
      this.auth.clearSession();
      this.sessionTimer.stop();
      this.alert.success('Sesión cerrada correctamente');
      this.router.navigateByUrl('/login');
    }
  }
  /**
   * Maneja el evento de extender sesión desde el modal
   */
  async onExtendSession() {
    try {
      await this.loading.wrap(() => firstValueFrom(this.auth.refresh()));
      this.sessionTimer.reset();
      this.showSessionWarning.set(false);
    } catch (error) {
      // Si falla el refresh, cerrar sesión
      this.auth.clearSession();
      this.sessionTimer.stop();
      this.router.navigateByUrl('/login');
    }
  }

  /**
   * Maneja el evento de logout desde el modal
   */
  onLogoutFromModal() {
    this.auth.clearSession();
    this.sessionTimer.stop();
    this.showSessionWarning.set(false);
    this.router.navigateByUrl('/login');
  }
}
