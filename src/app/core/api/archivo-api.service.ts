import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, filter, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { resolverUrlApi } from '../../shared/utils/resolver-url-api';
import { ArchivoPublico, ContextoArchivo, EventoSubida, Uuid } from '../models';

function _aEventoSubida(evento: HttpEvent<ArchivoPublico>): EventoSubida | null {
  if (evento.type === HttpEventType.UploadProgress) {
    const total = evento.total ?? 0;
    return {
      tipo: 'progreso',
      porcentaje: total > 0 ? Math.round((evento.loaded / total) * 100) : 0,
    };
  }
  if (evento.type === HttpEventType.Response && evento.body) {
    return { tipo: 'completado', archivo: evento.body };
  }
  return null;
}

@Injectable({ providedIn: 'root' })
export class ArchivoApiService {
  private readonly http = inject(HttpClient);

  /** Subida multipart con progreso. La validación real (tipo y tamaño) la hace el backend. */
  subir(archivo: File, contexto: ContextoArchivo, idContexto: Uuid): Observable<EventoSubida> {
    const datos = new FormData();
    datos.append('archivo', archivo, archivo.name);
    datos.append('contexto', contexto);
    datos.append('id_contexto', idContexto);
    return this.http
      .post<ArchivoPublico>('/archivos', datos, { reportProgress: true, observe: 'events' })
      .pipe(
        map(_aEventoSubida),
        filter((evento): evento is EventoSubida => evento !== null),
      );
  }

  /** URL del contenido servido por la API (para `<img>` o enlaces de descarga). */
  urlContenido(idArchivo: Uuid): string {
    return (
      resolverUrlApi(
        `${environment.apiBaseUrl}/archivos/${encodeURIComponent(idArchivo)}/contenido`,
      ) ?? ''
    );
  }

  eliminar(idArchivo: Uuid): Observable<void> {
    return this.http.delete<void>(`/archivos/${encodeURIComponent(idArchivo)}`);
  }
}
