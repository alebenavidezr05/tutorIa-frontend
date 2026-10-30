import { HttpContext, HttpContextToken } from '@angular/common/http';

/** La petición maneja su error en pantalla: el interceptor no muestra notificación ni redirige. */
export const OMITIR_NOTIFICACION = new HttpContextToken<boolean>(() => false);

/** La petición es pública y no debe enviar la cookie de sesión (pantallas del acudiente). */
export const SIN_CREDENCIALES = new HttpContextToken<boolean>(() => false);

export function contextoSilencioso(contexto = new HttpContext()): HttpContext {
  return contexto.set(OMITIR_NOTIFICACION, true);
}

export function contextoPublico(contexto = new HttpContext()): HttpContext {
  return contexto.set(SIN_CREDENCIALES, true);
}
