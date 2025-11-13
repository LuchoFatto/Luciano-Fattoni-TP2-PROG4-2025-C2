import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center" [ngClass]="containerClass">
      <svg class="animate-spin" [ngClass]="sizeClass" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="4" />
      </svg>
      @if (label) {
      <span class="ml-2 text-sm">{{ label }}</span>
      }
    </div>
  `,
  host: {
    class: 'text-silver',
    '[class.inline-flex]': 'inline',
    '[class.block]': '!inline',
  },
})
export class SpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() inline = false;
  @Input() label = '';

  get sizeClass(): string {
    const sizes = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
    };
    return sizes[this.size];
  }

  get containerClass(): string {
    return this.inline ? '' : 'min-h-[80px]';
  }
}
