import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input.html',
})
export class InputComponent {
  @Input({ required: true }) control!: FormControl;
  @Input() type: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'date' | 'number' =
    'text';
  @Input() placeholder = '';
  @Input() autocomplete = 'off';
  @Input() readonly = false;
  @Input() ariaLabel = '';

  currentType = 'text'; // default, será corregido en ngOnInit

  ngOnInit() {
    // AHORA sí toma el valor real del @Input
    this.currentType = this.type;
  }

  toggleVisibility() {
    this.currentType = this.currentType === 'password' ? 'text' : 'password';
  }
}
