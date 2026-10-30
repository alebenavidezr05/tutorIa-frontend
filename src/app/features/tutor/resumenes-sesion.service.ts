import { Injectable, signal } from '@angular/core';
import { ResumenSesion, Uuid } from '../../core/models';

/** Último resumen de cada sesión cerrada en esta visita (solo en memoria). */
@Injectable({ providedIn: 'root' })
export class ResumenesSesionService {
  private readonly resumenes = signal<ReadonlyMap<Uuid, ResumenSesion>>(new Map());

  guardar(idConversacion: Uuid, resumen: ResumenSesion): void {
    this.resumenes.update((mapa) => new Map(mapa).set(idConversacion, resumen));
  }

  de(idConversacion: Uuid): ResumenSesion | null {
    return this.resumenes().get(idConversacion) ?? null;
  }
}
