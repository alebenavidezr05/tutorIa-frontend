import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { contextoPublico, contextoSilencioso } from '../http/contextos';
import {
  AutorizacionPublica,
  AutorizacionPublicaApi,
  EstadoAutorizacion,
  MiAutorizacion,
  MiAutorizacionApi,
  ReenviarAutorizacionEntrada,
} from '../models';

/**
 * ÚNICO punto que traduce el estado del backend al de las pantallas:
 * PENDIENTE_VERIFICACION → PENDIENTE, VENCIDA → EXPIRADA; AUTORIZADA, REVOCADA, RECHAZADA,
 * PENDIENTE, EXPIRADA y SIN_SOLICITUD pasan tal cual. Cualquier otro valor → DESCONOCIDO.
 */
export function normalizarEstadoAutorizacion(estado: unknown): EstadoAutorizacion {
  switch (estado) {
    case 'PENDIENTE_VERIFICACION':
    case 'PENDIENTE':
      return 'PENDIENTE';
    case 'VENCIDA':
    case 'EXPIRADA':
      return 'EXPIRADA';
    case 'AUTORIZADA':
    case 'REVOCADA':
    case 'RECHAZADA':
    case 'SIN_SOLICITUD':
      return estado;
    default:
      return 'DESCONOCIDO';
  }
}

function _normalizar<T extends { estado: unknown }>(
  respuesta: T,
): Omit<T, 'estado'> & { estado: EstadoAutorizacion } {
  return { ...respuesta, estado: normalizarEstadoAutorizacion(respuesta.estado) };
}

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
    return this.http
      .get<MiAutorizacionApi>('/autorizaciones/mia', { context: contextoSilencioso() })
      .pipe(map((r): MiAutorizacion => _normalizar(r)));
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
    return this.http
      .post<AutorizacionPublicaApi>(
        '/autorizaciones/consultar',
        { token },
        { context: contextoPublico(contextoSilencioso()) },
      )
      .pipe(map((r): AutorizacionPublica => _normalizar(r)));
  }

  confirmar(token: string, versionPolitica: string): Observable<AutorizacionPublica> {
    return this.http
      .post<AutorizacionPublicaApi>(
        '/autorizaciones/confirmar',
        { token, version_politica: versionPolitica },
        { context: contextoPublico(contextoSilencioso()) },
      )
      .pipe(map((r): AutorizacionPublica => _normalizar(r)));
  }

  rechazar(token: string): Observable<AutorizacionPublica> {
    return this.http
      .post<AutorizacionPublicaApi>(
        '/autorizaciones/rechazar',
        { token },
        { context: contextoPublico(contextoSilencioso()) },
      )
      .pipe(map((r): AutorizacionPublica => _normalizar(r)));
  }

  revocar(token: string, eliminarDatos: boolean): Observable<AutorizacionPublica> {
    return this.http
      .post<AutorizacionPublicaApi>(
        '/autorizaciones/revocar',
        { token, eliminar_datos: eliminarDatos },
        { context: contextoPublico() },
      )
      .pipe(map((r): AutorizacionPublica => _normalizar(r)));
  }
}
