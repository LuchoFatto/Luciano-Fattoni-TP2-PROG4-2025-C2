import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SessionTimerService {
  // Tiempo en minutos
  private readonly WARNING_TIME = 10; // Mostrar advertencia a los 10 min (quedan 5 min)
  private readonly SESSION_DURATION = 15; // Token expira a los 15 min

  // Estado del timer
  private timerInterval: any = null;
  private startTime: number | null = null;

  // Signals
  isActive = signal(false);
  timeRemaining = signal(0); // Segundos restantes

  // Subject para emitir cuando llegue el momento de mostrar la advertencia
  warningTriggered$ = new Subject<void>();

  /**
   * Inicia el countdown de 10 minutos
   * Se debe llamar después del login o refresh exitoso
   */
  start() {
    this.stop(); // Detener cualquier timer anterior

    this.startTime = Date.now();
    this.isActive.set(true);

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
    const timeUntilWarning = this.WARNING_TIME * 60 - elapsed; // Segundos hasta mostrar warning

    // Tiempo real restante = tiempo hasta expiración del token - tiempo transcurrido
    const timeUntilExpiration = this.SESSION_DURATION * 60 - elapsed; // Segundos hasta expiración
    const realTimeRemaining = timeUntilExpiration - this.WARNING_TIME * 60; // Los 5 min restantes

    this.timeRemaining.set(realTimeRemaining);

    // Si llegamos al momento de mostrar advertencia (10min transcurridos)
    if (timeUntilWarning <= 0 && this.isActive()) {
      this.warningTriggered$.next();
      this.stop(); // Detener el timer para no emitir múltiples veces
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
