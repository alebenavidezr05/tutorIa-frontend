import { HttpContext } from '@angular/common/http';
import { contextoSilencioso } from '../http/contextos';

/** Opciones comunes de los servicios de API. */
export interface OpcionesApi {
  /** La pantalla gestiona el error: el interceptor no notifica ni redirige. */
  silencioso?: boolean;
}

export function contextoDe(opciones?: OpcionesApi): HttpContext {
  return opciones?.silencioso ? contextoSilencioso() : new HttpContext();
}
