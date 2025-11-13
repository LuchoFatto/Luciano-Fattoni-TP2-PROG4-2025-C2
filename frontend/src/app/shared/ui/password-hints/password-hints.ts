import { Component, Input, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'ui-password-hints',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './password-hints.html',
  styleUrls: ['./password-hints.css'],
})
export class PasswordHintsComponent {
  @Input({ required: true }) control!: FormControl<string | null>;

  // Señal computada reactiva a los cambios del control
  checks: Signal<{
    lengthOk: boolean;
    upperOk: boolean;
    numberOk: boolean;
    symbolOk: boolean;
  }> = computed(() => {
    const value = this.control?.value ?? '';
    return {
      lengthOk: value.length >= 8,
      upperOk: /[A-Z]/.test(value),
      numberOk: /\d/.test(value),
      symbolOk: /[\W_]/.test(value),
    };
  });

  // Devuelve true si todos los requisitos se cumplen
  allValid = computed(() => Object.values(this.checks()).every(Boolean));
}
