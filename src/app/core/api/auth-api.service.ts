import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { contextoSilencioso } from '../http/contextos';
import { LoginEntrada, RegistroEntrada, UsuarioPublico } from '../models';
import { OpcionesApi, contextoDe } from './opciones-api';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);

  registrar(datos: RegistroEntrada): Observable<UsuarioPublico> {
    return this.http.post<UsuarioPublico>('/auth/registro', datos);
  }

  iniciarSesion(datos: LoginEntrada): Observable<UsuarioPublico> {
    return this.http.post<UsuarioPublico>('/auth/login', datos);
  }

  cerrarSesion(): Observable<void> {
    return this.http.post<void>('/auth/logout', null, { context: contextoSilencioso() });
  }

  obtenerActual(opciones?: OpcionesApi): Observable<UsuarioPublico> {
    return this.http.get<UsuarioPublico>('/auth/me', { context: contextoDe(opciones) });
  }
}
