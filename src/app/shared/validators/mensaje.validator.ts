import { normalizarTexto } from './texto.validator';

/** Espejo de `LONGITUD_MAX_MENSAJE` del backend. */
export const LONGITUD_MAX_MENSAJE = 1500;
export const LONGITUD_MAX_DETALLE_SOLICITUD = 2000;
export const LONGITUD_MIN_DETALLE_SOLICITUD = 5;
export const LONGITUD_MAX_RESPUESTA_ACTIVIDAD = 4000;
export const LONGITUD_MAX_COMENTARIO_REPORTE = 500;

/** El mensaje se puede enviar si tiene 1–1500 caracteres tras normalizar. */
export function mensajeEnviable(texto: string): boolean {
  const longitud = normalizarTexto(texto).length;
  return longitud >= 1 && longitud <= LONGITUD_MAX_MENSAJE;
}
