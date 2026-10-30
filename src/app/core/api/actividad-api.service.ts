import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ActividadPublica, ActualizarActividadEntrada, Uuid } from '../models';

@Injectable({ providedIn: 'root' })
export class ActividadApiService {
  private readonly http = inject(HttpClient);

  actualizar(idActividad: Uuid, datos: ActualizarActividadEntrada): Observable<ActividadPublica> {
    return this.http.patch<ActividadPublica>(
      `/actividades/${encodeURIComponent(idActividad)}`,
      datos,
    );
  }
}
