import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { contextoPublico, contextoSilencioso } from '../http/contextos';
import { AutorizacionPublica, MiAutorizacion, ReenviarAutorizacionEntrada } from '../models';

/**
 * Autorización del adulto responsable.
 * - `mia` y `reenviar` los usa el estudiante con sesión (cookie).
 * - El resto son de la pantalla pública del adulto: sin sesión y sin cookies. El token llega en
 *   el fragmento de la URL y solo viaja en el cuerpo de un POST (nunca en la URL ni en registros).
 */
@Injectable({ providedIn: 'root' })
export class AutorizacionApiService {
  private readonly http = inject(HttpClient);

  mia(): Observable<MiAutorizacion> {
    return this.http.get<MiAutorizacion>('/autorizaciones/mia', {
      context: contextoSilencioso(),
    });
  }

  /** Sin correo reenvía al mismo adulto; con correo cambia de destinatario. Responde 202. */
  reenviar(correoAcudiente?: string): Observable<void> {
    const cuerpo: ReenviarAutorizacionEntrada = correoAcudiente
      ? { correo_acudiente: correoAcudiente }
      : {};
    return this.http.post<void>('/autorizaciones/reenviar', cuerpo, {
      context: contextoSilencioso(),
    });
  }

  consultar(token: string): Observable<AutorizacionPublica> {
    return this.http.post<AutorizacionPublica>(
      '/autorizaciones/consultar',
      { token },
      { context: contextoPublico(contextoSilencioso()) },
    );
  }

  confirmar(token: string, versionPolitica: string): Observable<AutorizacionPublica> {
    return this.http.post<AutorizacionPublica>(
      '/autorizaciones/confirmar',
      { token, version_politica: versionPolitica },
      { context: contextoPublico(contextoSilencioso()) },
    );
  }

  rechazar(token: string): Observable<AutorizacionPublica> {
    return this.http.post<AutorizacionPublica>(
      '/autorizaciones/rechazar',
      { token },
      { context: contextoPublico(contextoSilencioso()) },
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
