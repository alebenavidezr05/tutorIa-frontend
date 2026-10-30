import { WritableSignal } from '@angular/core';
import { MonoTypeOperatorFunction, defer, finalize } from 'rxjs';

/**
 * Pone `cargando` en `true` al suscribirse y en `false` al terminar (éxito, error o cancelación).
 * Todas las páginas lo reutilizan: ningún componente maneja su propio `finalize`.
 */
export function conIndicador<T>(cargando: WritableSignal<boolean>): MonoTypeOperatorFunction<T> {
  return (fuente) =>
    defer(() => {
      cargando.set(true);
      return fuente.pipe(finalize(() => cargando.set(false)));
    });
}
