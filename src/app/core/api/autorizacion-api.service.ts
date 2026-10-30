import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { contextoPublico, contextoSilencioso } from '../http/contextos';
import { AutorizacionPublica, MensajeGenerico, SolicitudAutorizacionEntrada } from '../models';

/**
 * Pantallas públicas del acudiente: sin sesión y sin cookies. El token llega en el fragmento de
 * la URL y solo viaja en el cuerpo de un POST (nunca en la URL ni en registros del servidor).
 */
@Injectable({ providedIn: 'root' })
export class AutorizacionApiService {
  private readonly http = inject(HttpClient);

  solicitar(datos: SolicitudAutorizacionEntrada): Observable<MensajeGenerico> {
    return this.http.post<MensajeGenerico>('/autorizaciones', datos, {
      context: contextoPublico(),
    });
  }

  consultar(token: string): Observable<AutorizacionPublica> {
    return this.http.post<AutorizacionPublica>(
      '/autorizaciones/consultar',
      { token },
      { context: contextoPublico(contextoSilencioso()) },
    );
  }

  confirmar(token: string): Observable<AutorizacionPublica> {
    return this.http.post<AutorizacionPublica>(
      '/autorizaciones/confirmar',
      { token },
      { context: contextoPublico() },
    );
  }

  revocar(token: string, eliminarDatos: boolean): Observable<AutorizacionPublica> {
    return this.http.post<AutorizacionPublica>(
      '/autorizaciones/revocar',
      { token, eliminar_datos: eliminarDatos },
      { context: contextoPublico() },
    );
  }
}
