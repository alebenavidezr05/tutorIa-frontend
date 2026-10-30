import { Signal, computed } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, Validators } from '@angular/forms';
import { startWith, switchMap } from 'rxjs';
import { mensajeDeError } from '../../validators/mensajes-validacion';

export interface EstadoControl {
  /** Mensaje del primer error visible (tras tocar el campo), o `null`. */
  readonly mensajeError: Signal<string | null>;
  readonly obligatorio: Signal<boolean>;
}

/**
 * Convierte el estado de un control reactivo en señales (necesario con OnPush y sin zone.js).
 * Debe llamarse en un contexto de inyección (inicializador de campo de un componente).
 */
export function estadoControl(control: Signal<AbstractControl>): EstadoControl {
  const eventos = toSignal(
    toObservable(control).pipe(switchMap((c) => c.events.pipe(startWith(null)))),
    { initialValue: null },
  );
  const mensajeError = computed(() => {
    eventos();
    const c = control();
    return c.invalid && c.touched ? mensajeDeError(c.errors) : null;
  });
  const obligatorio = computed(() => {
    const c = control();
    return c.hasValidator(Validators.required) || c.hasValidator(Validators.requiredTrue);
  });
  return { mensajeError, obligatorio };
}
