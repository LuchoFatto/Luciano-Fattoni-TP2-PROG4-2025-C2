import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'ui-textarea',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <textarea
      class="input-base resize-none transition-shadow"
      [class.border-red-500]="control.invalid && control.touched"
      [class.focus:ring-red-500]="control.invalid && control.touched"
      [rows]="rows"
      [placeholder]="placeholder"
      [formControl]="control"
      [readonly]="readonly"
      [attr.aria-label]="ariaLabel"
      [attr.aria-invalid]="control.invalid && control.touched"
      [maxlength]="maxLength || null"
    ></textarea>
    @if (showCount && maxLength) {
    <div class="text-xs text-gray-500 text-right mt-1">
      {{ control.value?.length || 0 }} / {{ maxLength }}
    </div>
    }
  `,
})
export class TextareaComponent {
  @Input({ required: true }) control!: FormControl;
  @Input() placeholder = '';
  @Input() rows = 4;
  @Input() readonly = false;
  @Input() ariaLabel = '';
  @Input() maxLength?: number;
  @Input() showCount = false;
}
