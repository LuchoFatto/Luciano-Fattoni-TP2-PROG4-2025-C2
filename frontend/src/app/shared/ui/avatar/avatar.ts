import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="rounded-full overflow-hidden flex items-center justify-center ring-2 ring-offset-2 ring-silver/20 transition-transform hover:scale-105"
      [ngClass]="sizeClass"
      [style.backgroundColor]="bgColor"
    >
      @if (src) {
      <img [src]="src" [alt]="alt" class="w-full h-full object-cover" />
      } @else {
      <span class="font-semibold text-white select-none" [ngClass]="textSizeClass">
        {{ initials }}
      </span>
      }
    </div>
  `,
})
export class AvatarComponent {
  @Input() src?: string | null;
  @Input() alt = 'Avatar';
  @Input() name = '';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() bgColor = 'var(--coffee)';

  get sizeClass(): string {
    const sizes = {
      xs: 'w-6 h-6',
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-16 h-16',
      xl: 'w-24 h-24',
    };
    return sizes[this.size];
  }

  get textSizeClass(): string {
    const sizes = {
      xs: 'text-[10px]',
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-xl',
      xl: 'text-3xl',
    };
    return sizes[this.size];
  }

  get initials(): string {
    if (!this.name.trim()) return '?';

    return this.name
      .trim()
      .split(' ')
      .filter((n) => n.length > 0)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
