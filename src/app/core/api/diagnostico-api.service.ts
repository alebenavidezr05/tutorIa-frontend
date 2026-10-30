import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CuestionarioPublico, RespuestaPregunta, ResultadoDiagnostico, Uuid } from '../models';

@Injectable({ providedIn: 'root' })
export class DiagnosticoApiService {
  private readonly http = inject(HttpClient);

  crear(tema: string): Observable<CuestionarioPublico> {
    return this.http.post<CuestionarioPublico>('/diagnostico', { tema });
  }

  obtener(idSesion: Uuid): Observable<CuestionarioPublico> {
    return this.http.get<CuestionarioPublico>(`/diagnostico/${encodeURIComponent(idSesion)}`);
  }

  enviarRespuestas(
    idSesion: Uuid,
    respuestas: RespuestaPregunta[],
  ): Observable<ResultadoDiagnostico> {
    return this.http.post<ResultadoDiagnostico>(
      `/diagnostico/${encodeURIComponent(idSesion)}/respuestas`,
      { respuestas },
    );
  }
}
