import { ApiError, CodigoError } from '../../core/models';

/** Aviso amable que una pantalla muestra en lugar de un error genérico. */
export type AvisoPagina =
  | { readonly tipo: 'limite'; readonly mensaje: string }
  | { readonly tipo: 'premium'; readonly mensaje: string }
  | { readonly tipo: 'compra'; readonly mensaje: string }
  | { readonly tipo: 'reintentar'; readonly mensaje: string };

export const MENSAJE_LIMITE_USO =
  'Llegaste al límite de hoy para esto; vuelve mañana o mejora tu plan.';
export const MENSAJE_LLM_PLAN =
  'Estamos teniendo problemas para generar tu plan. Inténtalo de nuevo en un momento.';
export const MENSAJE_COMPRA_NO_PERMITIDA =
  'Tu acudiente no habilitó las compras en esta cuenta. Pídele que lo autorice desde el enlace de autorización.';

/**
 * Traduce los códigos que se muestran en pantalla (§6) a un aviso. Devuelve `null` para los demás
 * (ya los notificó el interceptor o los maneja el formulario).
 */
export function avisoDeError(
  error: ApiError,
  mensajeLlm: string = MENSAJE_LLM_PLAN,
): AvisoPagina | null {
  switch (error.codigo as CodigoError) {
    case 'LIMITE_PLAN_GRATUITO':
      return { tipo: 'limite', mensaje: error.mensaje };
    case 'LIMITE_USO':
      return { tipo: 'limite', mensaje: MENSAJE_LIMITE_USO };
    case 'FUNCION_PREMIUM':
      return { tipo: 'premium', mensaje: error.mensaje };
    case 'COMPRA_NO_PERMITIDA':
      return { tipo: 'compra', mensaje: MENSAJE_COMPRA_NO_PERMITIDA };
    case 'LLM_NO_DISPONIBLE':
    case 'LLM_RESPUESTA_INVALIDA':
      return { tipo: 'reintentar', mensaje: mensajeLlm };
    default:
      return null;
  }
}
