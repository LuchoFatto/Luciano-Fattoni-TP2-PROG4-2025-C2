import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SessionTimerService {
  // Tiempo en minutos
  private readonly WARNING_TIME = 10; // Mostrar advertencia cuando quede 10 min
  private readonly SESSION_DURATION = 15; // Token expira a los 15 min

  // Estado del timer
  private timerInterval: any = null;
  private startTime: number | null = null;

  // Signals
  isActive = signal(false);
  timeRemaining = signal(0); // Segundos restantes
  warningShown = signal(false); // controla si ya se mostró el warning

  // Subject para emitir cuando llegue el momento de mostrar la advertencia
  warningTriggered$ = new Subject<void>();

  /**
   * Inicia el countdown
   * Se debe llamar después del login o refresh exitoso
   */
  start() {
    this.stop(); // Detener cualquier timer anterior

    this.startTime = Date.now();
    this.isActive.set(true);
    this.warningShown.set(false); // Resetear flag

    // Actualizar cada segundo
    this.timerInterval = setInterval(() => {
      this.tick();
    }, 1000);
  }

  /**
   * Detiene el timer (logout o sesión expirada)
   */
  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.isActive.set(false);
    this.timeRemaining.set(0);
    this.warningShown.set(false); // Resetear flag
    this.startTime = null;
  }

  /**
   * Reinicia el timer (después de refresh exitoso)
   */
  reset() {
    this.start();
  }

  /**
   * Tick del countdown
   */
  private tick() {
    if (!this.startTime) return;

    const elapsed = Math.floor((Date.now() - this.startTime) / 1000); // Segundos transcurridos
    const timeUntilExpiration = this.SESSION_DURATION * 60 - elapsed; // Segundos hasta expiración total

    // Actualizar el tiempo restante SIEMPRE (no detener el timer)
    this.timeRemaining.set(Math.max(0, timeUntilExpiration));

    // Calcular minutos restantes
    const minutesRemaining = timeUntilExpiration / 60;

    // Mostrar warning solo UNA VEZ cuando quede WARNING_TIME minutos
    if (minutesRemaining <= this.WARNING_TIME && !this.warningShown()) {
      this.warningShown.set(true); // Marcar como mostrado
      this.warningTriggered$.next();
      // NO detener el timer aquí - dejarlo corriendo
    }

    // Si el tiempo llegó a 0, detener el timer y cerrar sesión
    if (timeUntilExpiration <= 0) {
      this.stop();
    }
  }

  /**
   * Obtiene el tiempo restante formateado (mm:ss)
   */
  getFormattedTime(): string {
    const seconds = this.timeRemaining();
    if (seconds <= 0) return '00:00';

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
