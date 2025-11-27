import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

/**
 * Detecta clicks fuera del elemento
 * Uso: <div (clickOutside)="close()">...</div>
 */
@Directive({
  selector: '[clickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<MouseEvent>();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);

    if (!clickedInside) {
      this.clickOutside.emit(event);
    }
  }
}
