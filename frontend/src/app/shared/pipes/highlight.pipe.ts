import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Resalta (highlight) texto buscado dentro de un string
 * Uso: <div [innerHTML]="texto | highlight:'palabra'"></div>
 */
@Pipe({
  name: 'highlight',
  standalone: true,
})
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, search: string): SafeHtml {
    if (!value || !search) {
      return value;
    }

    const regex = new RegExp(search, 'gi');
    const highlightedText = value.replace(
      regex,
      (match) => `<mark class="bg-yellow-300 px-1 rounded">${match}</mark>`
    );

    return this.sanitizer.bypassSecurityTrustHtml(highlightedText);
  }
}
