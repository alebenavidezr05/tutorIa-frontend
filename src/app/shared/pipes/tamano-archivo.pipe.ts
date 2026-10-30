import { Pipe, PipeTransform } from '@angular/core';

export function formatearTamano(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
}

@Pipe({ name: 'tamanoArchivo' })
export class TamanoArchivoPipe implements PipeTransform {
  transform(bytes: number | null | undefined): string {
    return formatearTamano(bytes ?? 0);
  }
}
