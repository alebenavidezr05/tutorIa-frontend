import { Injectable, signal } from '@angular/core';

export type TipoNotificacion = 'exito' | 'error' | 'info';

export interface Notificacion {
  readonly id: number;
  readonly tipo: TipoNotificacion;
  readonly mensaje: string;
}

const DURACION_MS: Record<TipoNotificacion, number> = { exito: 5000, info: 6000, error: 9000 };
const MAXIMO_EN_COLA = 4;

/** Cola de mensajes para el usuario. La pinta `ToastComponent` con `aria-live`. */
@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private readonly _cola = signal<readonly Notificacion[]>([]);
  private siguienteId = 1;

  readonly cola = this._cola.asReadonly();

  exito(mensaje: string): void {
    this.mostrar('exito', mensaje);
  }

  info(mensaje: string): void {
    this.mostrar('info', mensaje);
  }

  error(mensaje: string): void {
    this.mostrar('error', mensaje);
  }

  mostrar(tipo: TipoNotificacion, mensaje: string): void {
    const repetida = this._cola().some((n) => n.mensaje === mensaje && n.tipo === tipo);
    if (repetida) {
      return;
    }
    const notificacion: Notificacion = { id: this.siguienteId++, tipo, mensaje };
    this._cola.update((cola) => [...cola, notificacion].slice(-MAXIMO_EN_COLA));
    setTimeout(() => this.cerrar(notificacion.id), DURACION_MS[tipo]);
  }

  cerrar(id: number): void {
    this._cola.update((cola) => cola.filter((n) => n.id !== id));
  }
}
