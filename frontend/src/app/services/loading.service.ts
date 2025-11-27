import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  isLoading = signal(false);
  message = signal('Procesando...');

  show(message = 'Procesando...') {
    this.message.set(message);
    this.isLoading.set(true);
  }

  hide() {
    this.isLoading.set(false);
  }

  /**
   * Ejecuta una operación async mostrando loading automáticamente
   */
  async wrap<T>(operation: () => Promise<T>, message = 'Procesando...'): Promise<T> {
    this.show(message);
    try {
      return await operation();
    } finally {
      this.hide();
    }
  }
}
