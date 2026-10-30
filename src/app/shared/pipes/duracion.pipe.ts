import { Pipe, PipeTransform } from '@angular/core';

/** 245 → "4:05" (formato visible). */
export function formatearDuracion(segundos: number): string {
  const total = Math.max(0, Math.round(segundos));
  const horas = Math.floor(total / 3600);
  const minutos = Math.floor((total % 3600) / 60);
  const resto = String(total % 60).padStart(2, '0');
  return horas > 0
    ? `${horas}:${String(minutos).padStart(2, '0')}:${resto}`
    : `${minutos}:${resto}`;
}

/** 245 → "4 minutos y 5 segundos" (para lectores de pantalla). */
export function duracionLegible(segundos: number): string {
  const total = Math.max(0, Math.round(segundos));
  const minutos = Math.floor(total / 60);
  const resto = total % 60;
  const partes = [
    minutos > 0 ? `${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}` : null,
    resto > 0 ? `${resto} ${resto === 1 ? 'segundo' : 'segundos'}` : null,
  ].filter((p): p is string => p !== null);
  return partes.join(' y ') || '0 segundos';
}

@Pipe({ name: 'duracion' })
export class DuracionPipe implements PipeTransform {
  transform(segundos: number | null | undefined, modo: 'corto' | 'legible' = 'corto'): string {
    return modo === 'legible' ? duracionLegible(segundos ?? 0) : formatearDuracion(segundos ?? 0);
  }
}
