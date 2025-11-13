// src/app/shared/validators/error-messages.ts
import { AbstractControl } from '@angular/forms';

/**
 * Devuelve un mensaje legible según el primer error relevante del control.
 * Compatibe con validadores nativos + custom actuales y, opcionalmente,
 * con claves granulares de password (pwLength, pwUpper, pwNumber, pwSymbol).
 */
export function getErrorMessage(control: AbstractControl | null): string | null {
  if (!control || !control.errors || !control.touched) return null;

  const e = control.errors;

  // 1) Errores nativos: prioridad alta
  if (e['required']) return 'Este campo es obligatorio';
  if (e['email']) return 'El correo electrónico no es válido';
  if (e['minlength']) return `Debe tener al menos ${e['minlength'].requiredLength} caracteres`;
  if (e['maxlength']) return `No puede superar los ${e['maxlength'].requiredLength} caracteres`;
  if (e['pattern']) return 'El formato ingresado no es válido';

  // 2) Errores custom ya usados en tu proyecto
  if (e['invalidName']) return 'Solo se permiten letras';
  if (e['underAge']) return `Debes tener al menos ${e['underAge'].minAge ?? 13} años`;
  if (e['fieldsMismatch']) return 'Las contraseñas no coinciden';

  // 3) Password débil:
  //    - Si solo tenés 'weakPassword' mostramos un mensaje general
  //    - Si además usás flags granulares (pwLength, pwUpper, pwNumber, pwSymbol),
  //      armamos un mensaje específico indicando qué falta.
  if (e['weakPassword']) {
    const details: string[] = [];

    if (e['pwLength']) details.push('mínimo 8 caracteres');
    if (e['pwUpper']) details.push('al menos una mayúscula');
    if (e['pwNumber']) details.push('al menos un número');
    if (e['pwSymbol']) details.push('al menos un símbolo');

    if (details.length) {
      // Mensaje granular: “Falta: mínimo 8 caracteres, al menos un número…”
      return `La contraseña es débil. Falta: ${details.join(', ')}.`;
    }

    // Mensaje general (cuando no usás flags granulares)
    return 'Debe contener una mayúscula, un número y un símbolo';
  }

  // 4) Fallback
  return 'Valor inválido';
}
