import { Pipe, PipeTransform } from '@angular/core';

/**
 * Recorta un texto largo y agrega puntos suspensivos
 * Uso: {{ texto | truncate:50 }}
 */
@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number = 100, ellipsis: string = '...'): string {
    if (!value) return '';

    if (value.length <= limit) {
      return value;
    }

    return value.substring(0, limit).trim() + ellipsis;
  }
}
