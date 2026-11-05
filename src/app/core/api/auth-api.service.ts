import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { contextoPublico, contextoSilencioso } from '../http/contextos';
import {
  EstadoVerificacionCorreo,
  LoginEntrada,
  RegistroEntrada,
  UsuarioPublico,
  VerificacionCorreoRespuesta,
} from '../models';
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

  /** Pública: el token del enlace viaja solo en el cuerpo, sin cookie. */
  verificarCorreo(token: string): Observable<VerificacionCorreoRespuesta> {
    return this.http.post<VerificacionCorreoRespuesta>(
      '/auth/verificar-correo',
      { token },
      { context: contextoPublico(contextoSilencioso()) },
    );
  }

  reenviarVerificacion(): Observable<void> {
    return this.http.post<void>('/auth/verificar-correo/reenviar', null, {
      context: contextoSilencioso(),
    });
  }

  estadoVerificacion(): Observable<EstadoVerificacionCorreo> {
    return this.http.get<EstadoVerificacionCorreo>('/auth/verificar-correo/estado', {
      context: contextoSilencioso(),
    });
  }
}
