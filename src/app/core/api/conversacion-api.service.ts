import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { contextoSilencioso } from '../http/contextos';
import {
  ConversacionDetalle,
  ConversacionPublica,
  ConversacionesPagina,
  FeedbackEntrada,
  IniciarConversacionEntrada,
  MensajeTutorPublico,
  ReferenciaPublica,
  ReporteEntrada,
  ResumenSesion,
  Uuid,
} from '../models';
import { OpcionesApi, contextoDe } from './opciones-api';

function _ruta(idConversacion: Uuid): string {
  return `/conversaciones/${encodeURIComponent(idConversacion)}`;
}

@Injectable({ providedIn: 'root' })
export class ConversacionApiService {
  private readonly http = inject(HttpClient);

  crear(datos: IniciarConversacionEntrada): Observable<ConversacionPublica> {
    return this.http.post<ConversacionPublica>('/conversaciones', datos);
  }

  listar(pagina: number, tamano: number): Observable<ConversacionesPagina> {
    const params = new HttpParams().set('pagina', pagina).set('tamano', tamano);
    return this.http.get<ConversacionesPagina>('/conversaciones', { params });
  }

  obtener(idConversacion: Uuid): Observable<ConversacionDetalle> {
    return this.http.get<ConversacionDetalle>(_ruta(idConversacion));
  }

  enviarMensaje(
    idConversacion: Uuid,
    contenido: string,
    idArchivo?: Uuid | null,
  ): Observable<MensajeTutorPublico> {
    const cuerpo = idArchivo ? { contenido, id_archivo: idArchivo } : { contenido };
    return this.http.post<MensajeTutorPublico>(`${_ruta(idConversacion)}/mensajes`, cuerpo);
  }

  cerrar(idConversacion: Uuid, opciones?: OpcionesApi): Observable<ResumenSesion> {
    return this.http.post<ResumenSesion>(`${_ruta(idConversacion)}/cerrar`, null, {
      context: contextoDe(opciones),
    });
  }

  /**
   * Cierre al cerrar la pestaña: `fetch` con `keepalive` sobrevive a la descarga de la página.
   * No bloquea la navegación y su resultado se ignora.
   */
  cerrarAlSalir(idConversacion: Uuid): void {
    void fetch(`${environment.apiBaseUrl}${_ruta(idConversacion)}/cerrar`, {
      method: 'POST',
      keepalive: true,
      credentials: 'include',
    }).then(
      () => undefined,
      () => undefined,
    );
  }

  referencias(idConversacion: Uuid): Observable<ReferenciaPublica[]> {
    return this.http.get<ReferenciaPublica[]>(`${_ruta(idConversacion)}/referencias`, {
      context: contextoSilencioso(),
    });
  }

  eliminar(idConversacion: Uuid): Observable<void> {
    return this.http.delete<void>(_ruta(idConversacion));
  }

  registrarFeedback(idMensaje: Uuid, datos: FeedbackEntrada): Observable<void> {
    return this.http.post<void>(`/mensajes/${encodeURIComponent(idMensaje)}/feedback`, datos);
  }

  reportar(idMensaje: Uuid, datos: ReporteEntrada): Observable<void> {
    return this.http.post<void>(`/mensajes/${encodeURIComponent(idMensaje)}/reportar`, datos);
  }
}
