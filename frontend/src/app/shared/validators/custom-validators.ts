import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

/**
 * Verifica que dos campos tengan el mismo valor (ej: contraseñas).
 * Inyecta el error 'fieldsMismatch' directamente en el control dependiente.
 */
export function matchFieldsValidator(
  controlName: string,
  matchingControlName: string
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const form = group as FormGroup;
    const control = form.get(controlName);
    const match = form.get(matchingControlName);

    if (!control || !match) return null;

    const mismatch = control.value !== match.value;
    const currentErrors = match.errors || {};

    if (mismatch) {
      // Agrega nuestro error sin eliminar otros
      match.setErrors({ ...currentErrors, fieldsMismatch: true });
      return { fieldsMismatch: true };
    } else {
      // Limpia solo nuestro error si ya no aplica
      if ('fieldsMismatch' in currentErrors) {
        const { fieldsMismatch, ...rest } = currentErrors;
        match.setErrors(Object.keys(rest).length ? rest : null);
      }
      return null;
    }
  };
}

/**
 * Valida una contraseña fuerte.
 * Mínimo 8 caracteres, una mayúscula, un número y un símbolo.
 * Devuelve errores granulares (pwLength, pwUpper, pwNumber, pwSymbol).
 */
export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = (control.value || '') as string;
    if (!v) return null; // 'required' se maneja aparte

    const errors: ValidationErrors = {};
    if (v.length < 8) errors['pwLength'] = true;
    if (!/[A-Z]/.test(v)) errors['pwUpper'] = true;
    if (!/\d/.test(v)) errors['pwNumber'] = true;
    if (!/[\W_]/.test(v)) errors['pwSymbol'] = true;

    return Object.keys(errors).length ? { weakPassword: true, ...errors } : null;
  };
}

/**
 * Valida nombre o apellido (solo letras y espacios).
 */
export function onlyLettersValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value || '';
    if (!value) return null;

    const pattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    return pattern.test(value) ? null : { invalidName: true };
  };
}

/**
 * Valida que el usuario tenga al menos X años (por defecto 13).
 */
export function minimumAgeValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const birthDate = new Date(value);
    const today = new Date();

    const age =
      today.getFullYear() -
      birthDate.getFullYear() -
      (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);

    return age >= minAge ? null : { underAge: { minAge } };
  };
}
