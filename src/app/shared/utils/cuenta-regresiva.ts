import { DestroyRef, Signal, inject, signal } from '@angular/core';

/** 105 → "1:45" */
export function formatearCuenta(segundos: number): string {
  const s = Math.max(0, Math.ceil(segundos));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export interface CuentaRegresiva {
  /** Segundos que faltan (0 = ya se puede). */
  readonly espera: Signal<number>;
  iniciar(segundos: number): void;
}

/**
 * Cuenta regresiva de reenvío (segundos, de a uno). Se detiene sola al llegar a 0 o al destruir
 * el componente. Llamar en un contexto de inyección.
 */
export function crearCuentaRegresiva(): CuentaRegresiva {
  const espera = signal(0);
  let intervalo: ReturnType<typeof setInterval> | null = null;
  const detener = () => {
    if (intervalo !== null) {
      clearInterval(intervalo);
      intervalo = null;
    }
  };
  inject(DestroyRef).onDestroy(detener);

  return {
    espera: espera.asReadonly(),
    iniciar(segundos: number): void {
      detener();
      const inicial = Math.max(0, Math.ceil(segundos || 0));
      espera.set(inicial);
      if (inicial > 0) {
        intervalo = setInterval(() => {
          espera.update((s) => Math.max(0, s - 1));
          if (espera() === 0) {
            detener();
          }
        }, 1000);
      }
    },
  };
}
