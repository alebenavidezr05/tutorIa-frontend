import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ActualizarPerfilEntrada, UsuarioPublico, Uuid } from '../models';

@Injectable({ providedIn: 'root' })
export class PerfilApiService {
  private readonly http = inject(HttpClient);

  obtener(idUsuario: Uuid): Observable<UsuarioPublico> {
    return this.http.get<UsuarioPublico>(`/perfil/${encodeURIComponent(idUsuario)}`);
  }

  actualizar(idUsuario: Uuid, datos: ActualizarPerfilEntrada): Observable<UsuarioPublico> {
    return this.http.put<UsuarioPublico>(`/perfil/${encodeURIComponent(idUsuario)}`, datos);
  }

  desactivar(idUsuario: Uuid): Observable<void> {
    return this.http.delete<void>(`/perfil/${encodeURIComponent(idUsuario)}`);
  }
}
