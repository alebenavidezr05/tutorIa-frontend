import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CheckoutPublico, SuscripcionPublica } from '../models';
import { OpcionesApi, contextoDe } from './opciones-api';

@Injectable({ providedIn: 'root' })
export class SuscripcionApiService {
  private readonly http = inject(HttpClient);

  obtener(opciones?: OpcionesApi): Observable<SuscripcionPublica> {
    return this.http.get<SuscripcionPublica>('/suscripcion', { context: contextoDe(opciones) });
  }

  /** Devuelve `url_pago`; la página redirige con `window.location.assign`. */
  iniciarCheckout(): Observable<CheckoutPublico> {
    return this.http.post<CheckoutPublico>('/suscripcion/checkout', null);
  }

  /** Reporte de progreso en CSV (Premium: si no, el backend responde FUNCION_PREMIUM). */
  descargarReporte(): Observable<Blob> {
    return this.http.get('/reportes/progreso', {
      params: new HttpParams().set('formato', 'csv'),
      responseType: 'blob',
    });
  }
}
