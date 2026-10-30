import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PerfilAprendizajePublico } from '../models';

@Injectable({ providedIn: 'root' })
export class PerfilAprendizajeApiService {
  private readonly http = inject(HttpClient);

  obtener(): Observable<PerfilAprendizajePublico> {
    return this.http.get<PerfilAprendizajePublico>('/perfil-aprendizaje');
  }

  cambiarPersonalizacion(activa: boolean): Observable<PerfilAprendizajePublico> {
    return this.http.put<PerfilAprendizajePublico>('/perfil-aprendizaje/personalizacion', {
      activa,
    });
  }

  reiniciar(): Observable<void> {
    return this.http.delete<void>('/perfil-aprendizaje');
  }
}
