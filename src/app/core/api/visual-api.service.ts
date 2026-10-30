import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { contextoSilencioso } from '../http/contextos';
import { Uuid, VisualPublico } from '../models';

@Injectable({ providedIn: 'root' })
export class VisualApiService {
  private readonly http = inject(HttpClient);

  /** Consulta silenciosa: si el visual falla, se oculta sin mostrar error al estudiante. */
  consultar(idMensaje: Uuid): Observable<VisualPublico> {
    return this.http.get<VisualPublico>(`/mensajes/${encodeURIComponent(idMensaje)}/visual`, {
      context: contextoSilencioso(),
    });
  }
}
