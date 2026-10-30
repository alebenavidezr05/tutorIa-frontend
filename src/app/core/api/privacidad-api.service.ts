import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { contextoPublico } from '../http/contextos';
import {
  AceptarPoliticaEntrada,
  CambioConsentimientoEntrada,
  ConsentimientoPublico,
  CumplimientoPublico,
  MisDatos,
  PoliticaPublica,
  SolicitudEntrada,
  SolicitudPublica,
} from '../models';

@Injectable({ providedIn: 'root' })
export class PrivacidadApiService {
  private readonly http = inject(HttpClient);

  /** Pública: texto, versión y finalidades vigentes. */
  politica(): Observable<PoliticaPublica> {
    return this.http.get<PoliticaPublica>('/politica-tratamiento', { context: contextoPublico() });
  }

  /** Pública: proveedores de IA, datos enviados, edad mínima, retención y contacto. */
  cumplimiento(): Observable<CumplimientoPublico> {
    return this.http.get<CumplimientoPublico>('/cumplimiento', { context: contextoPublico() });
  }

  consentimientos(): Observable<ConsentimientoPublico[]> {
    return this.http.get<ConsentimientoPublico[]>('/privacidad/consentimientos');
  }

  cambiarConsentimiento(datos: CambioConsentimientoEntrada): Observable<ConsentimientoPublico> {
    return this.http.post<ConsentimientoPublico>('/privacidad/consentimientos', datos);
  }

  aceptarPolitica(datos: AceptarPoliticaEntrada): Observable<void> {
    return this.http.post<void>('/privacidad/aceptar-politica', datos);
  }

  misDatos(): Observable<MisDatos> {
    return this.http.get<MisDatos>('/privacidad/mis-datos');
  }

  /** Copia completa de mis datos en JSON. */
  exportar(): Observable<Blob> {
    return this.http.get('/privacidad/mis-datos/exportar', { responseType: 'blob' });
  }

  crearSolicitud(datos: SolicitudEntrada): Observable<SolicitudPublica> {
    return this.http.post<SolicitudPublica>('/privacidad/solicitudes', datos);
  }

  solicitudes(): Observable<SolicitudPublica[]> {
    return this.http.get<SolicitudPublica[]>('/privacidad/solicitudes');
  }
}
