import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  /**
   * Muestra un toast en la esquina superior derecha
   */
  toast(message: string, type: SweetAlertIcon = 'info', duration = 2500): void {
    Swal.fire({
      toast: true,
      position: 'bottom-end',
      icon: type,
      title: message,
      showConfirmButton: false,
      timer: duration,
      timerProgressBar: true,
      customClass: {
        popup: 'colored-toast',
      },
    });
  }

  /**
   * Toast de éxito
   */
  success(message: string, duration = 2500): void {
    this.toast(message, 'success', duration);
  }

  /**
   * Toast de error
   */
  error(message: string, duration = 3000): void {
    this.toast(message, 'error', duration);
  }

  /**
   * Toast de info
   */
  info(message: string, duration = 2500): void {
    this.toast(message, 'info', duration);
  }

  /**
   * Toast de advertencia
   */
  warning(message: string, duration = 2500): void {
    this.toast(message, 'warning', duration);
  }

  /**
   * Diálogo de confirmación
   */
  async confirm(
    title: string,
    text: string,
    confirmText = 'Aceptar',
    cancelText = 'Cancelar'
  ): Promise<boolean> {
    const result = await Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: 'var(--silver-lake-blue)',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
    });
    return result.isConfirmed;
  }

  /**
   * Diálogo de confirmación para acciones peligrosas
   */
  async confirmDanger(
    title: string,
    text: string,
    confirmText = 'Eliminar',
    cancelText = 'Cancelar'
  ): Promise<boolean> {
    const result = await Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
    });
    return result.isConfirmed;
  }

  /**
   * Alerta informativa
   */
  async alert(
    title: string,
    text: string,
    icon: SweetAlertIcon = 'info',
    confirmText = 'Entendido'
  ): Promise<void> {
    await Swal.fire({
      title,
      text,
      icon,
      confirmButtonText: confirmText,
      confirmButtonColor: 'var(--silver-lake-blue)',
    });
  }

  /**
   * Loading spinner
   */
  showLoading(title = 'Cargando...', text?: string): void {
    Swal.fire({
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }

  /**
   * Cierra cualquier alerta abierta
   */
  close(): void {
    Swal.close();
  }
}
