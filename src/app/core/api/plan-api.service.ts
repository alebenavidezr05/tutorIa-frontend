import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PlanDetalle, Uuid } from '../models';

@Injectable({ providedIn: 'root' })
export class PlanApiService {
  private readonly http = inject(HttpClient);

  generar(idSesion: Uuid): Observable<PlanDetalle> {
    return this.http.post<PlanDetalle>('/plan-aprendizaje', { id_sesion: idSesion });
  }

  obtener(idPlan: Uuid): Observable<PlanDetalle> {
    return this.http.get<PlanDetalle>(`/plan-aprendizaje/${encodeURIComponent(idPlan)}`);
  }
}
