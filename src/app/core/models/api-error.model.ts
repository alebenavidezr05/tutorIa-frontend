/** Códigos de error del backend que el frontend trata de forma especial (§6). */
export type CodigoError =
  | 'SESION_INVALIDA'
  | 'CREDENCIALES_INVALIDAS'
  | 'CORREO_YA_REGISTRADO'
  | 'LIMITE_PLAN_GRATUITO'
  | 'CONVERSACION_CERRADA'
  | 'MENSAJE_NO_PERMITIDO'
  | 'SESION_YA_EVALUADA'
  | 'CONSENTIMIENTO_REQUERIDO'
  | 'POLITICA_DESACTUALIZADA'
  | 'ORIGEN_NO_PERMITIDO'
  | 'AUTORIZACION_PENDIENTE'
  | 'CUENTA_DESACTIVADA'
  | 'FUNCION_PREMIUM'
  | 'COMPRA_NO_PERMITIDA'
  | 'LIMITE_USO'
  | 'ARCHIVO_NO_PERMITIDO'
  | 'ARCHIVO_MUY_GRANDE'
  | 'ARCHIVO_INVALIDO'
  | 'CONTENIDO_NO_PERMITIDO'
  | 'TEMA_NO_PERMITIDO'
  | 'TEMA_SIN_FUENTES'
  | 'AUTORIZACION_INVALIDA'
  | 'DEMASIADAS_SOLICITUDES'
  | 'EDAD_NO_PERMITIDA'
  | 'CORREO_ACUDIENTE_REQUERIDO'
  | 'CORREO_ACUDIENTE_INVALIDO'
  | 'LLM_NO_DISPONIBLE'
  | 'LLM_RESPUESTA_INVALIDA'
  | 'DATO_INVALIDO'
  | 'SIN_CONEXION'
  | 'ERROR_DESCONOCIDO';

export interface DetalleError {
  campo: string;
  mensaje: string;
}

export interface ApiError {
  readonly status: number;
  /** Código del backend (`CodigoError` u otro no listado). */
  readonly codigo: string;
  readonly mensaje: string;
  readonly detalles: DetalleError[] | null;
  /** Segundos de la cabecera `Retry-After` (solo si el servidor la envía, p. ej. en un 429). */
  readonly reintentarEnSegundos?: number;
}

/** Cuerpo uniforme de error del backend. */
export interface CuerpoErrorApi {
  error: { codigo: string; mensaje: string; detalles?: unknown };
}

export const MENSAJE_ERROR_GENERICO =
  'Ocurrió un error inesperado. Intenta de nuevo en un momento.';

export function esApiError(valor: unknown): valor is ApiError {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'codigo' in valor &&
    'mensaje' in valor &&
    'status' in valor
  );
}

/** Normaliza lo que llega al callback `error` de una suscripción. */
export function comoApiError(valor: unknown): ApiError {
  return esApiError(valor)
    ? valor
    : { status: 0, codigo: 'ERROR_DESCONOCIDO', mensaje: MENSAJE_ERROR_GENERICO, detalles: null };
}

export function tieneCodigo(error: ApiError, ...codigos: CodigoError[]): boolean {
  return (codigos as string[]).includes(error.codigo);
}
