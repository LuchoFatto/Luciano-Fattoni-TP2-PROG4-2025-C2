import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [disabled]="disabled || loading"
      [attr.type]="type"
      class="relative w-full h-full inline-flex items-center justify-center"
    >
      @if (loading) {
      <span class="absolute inset-0 flex items-center justify-center">
        <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path class="opacity-75" d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="4" />
        </svg>
      </span>
      }
      <span [class.invisible]="loading">
        <ng-content></ng-content>
      </span>
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: Variant = 'primary';
  @Input() size: Size = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() full = false;
  @Input() type: 'button' | 'submit' = 'button';

  @HostBinding('class')
  get hostClass(): string {
    const base = 'btn overflow-hidden rounded-lg';

    const sizes: Record<Size, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5',
      lg: 'px-6 py-3 text-lg',
    };

    const variants: Record<Variant, string> = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      outline: 'btn-outline',
      danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-60',
      ghost: 'bg-transparent hover:bg-gray-100 text-delft',
    };

    const width = this.full ? 'w-full block' : 'inline-block';

    return `${base} ${sizes[this.size]} ${variants[this.variant]} ${width}`.trim();
  }
}
