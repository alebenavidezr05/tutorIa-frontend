import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { SuscripcionApiService } from '../api/suscripcion-api.service';
import { Capacidad, LimitesPublicos, SuscripcionPublica } from '../models';

/**
 * Refleja lo que el backend dice que el plan permite (`GET /suscripcion`). No decide nada:
 * si la interfaz se manipula, el backend responde `FUNCION_PREMIUM` igualmente.
 */
@Injectable({ providedIn: 'root' })
export class CapacidadesService {
  private readonly api = inject(SuscripcionApiService);
  private readonly _suscripcion = signal<SuscripcionPublica | null>(null);

  readonly suscripcion = this._suscripcion.asReadonly();
  readonly cargada = computed(() => this._suscripcion() !== null);
  readonly esPremium = computed(() => this._suscripcion()?.plan === 'PREMIUM');
  readonly limites = computed<LimitesPublicos | null>(() => this._suscripcion()?.limites ?? null);
  private readonly capacidades = computed(
    () => new Set<Capacidad>(this._suscripcion()?.capacidades ?? []),
  );

  tiene(capacidad: Capacidad): Signal<boolean> {
    return computed(() => this.capacidades().has(capacidad));
  }

  refrescar(): void {
    this.api.obtener({ silencioso: true }).subscribe({
      next: (suscripcion) => this._suscripcion.set(suscripcion),
      error: () => undefined,
    });
  }

  limpiar(): void {
    this._suscripcion.set(null);
  }
}
