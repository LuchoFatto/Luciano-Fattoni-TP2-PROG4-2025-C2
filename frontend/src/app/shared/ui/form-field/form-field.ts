import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { getErrorMessage } from '../../validators/error-messages';

@Component({
  selector: 'ui-form-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-field.html',
  styleUrls: ['./form-field.css'],
})
export class FormFieldComponent {
  @Input() label = '';
  @Input() control?: FormControl;
  @Input() hint = '';

  @ContentChild('control', { read: TemplateRef })
  controlTpl?: TemplateRef<any>;

  get isRequired(): boolean {
    return this.control?.hasValidator(Validators.required) ?? false;
  }

  get errorText(): string | null {
    const c = this.control as AbstractControl;
    return getErrorMessage(c);
  }
}
