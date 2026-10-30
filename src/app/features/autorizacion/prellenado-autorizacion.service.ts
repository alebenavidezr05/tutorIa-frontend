import { Injectable, signal } from '@angular/core';

/**
 * Correo del estudiante para pre-llenar /autorizacion cuando se llega desde
 * /pendiente-autorizacion. Vive SOLO en memoria: nunca en el almacenamiento del navegador.
 */
@Injectable({ providedIn: 'root' })
export class PrellenadoAutorizacionService {
  private readonly _correoEstudiante = signal<string | null>(null);

  establecer(correo: string): void {
    this._correoEstudiante.set(correo);
  }

  /** Devuelve el correo y lo olvida (se usa una sola vez). */
  tomar(): string | null {
    const correo = this._correoEstudiante();
    this._correoEstudiante.set(null);
    return correo;
  }
}
