import { Directive, ElementRef, OnInit } from '@angular/core';

/**
 * Auto-enfoca un elemento cuando se renderiza
 * Uso: <input appAutofocus />
 */
@Directive({
  selector: '[appAutofocus]',
  standalone: true,
})
export class AutofocusDirective implements OnInit {
  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    // Pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => {
      this.el.nativeElement.focus();
    }, 0);
  }
}
