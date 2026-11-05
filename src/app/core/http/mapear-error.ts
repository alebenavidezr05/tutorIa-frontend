import { HttpErrorResponse } from '@angular/common/http';
import { ApiError, CuerpoErrorApi, DetalleError, MENSAJE_ERROR_GENERICO } from '../models';

export const MENSAJE_SIN_CONEXION =
  'No pudimos conectarnos con TutorIA. Revisa tu conexión a internet e intenta de nuevo.';

function _esCuerpoErrorApi(cuerpo: unknown): cuerpo is CuerpoErrorApi {
  if (typeof cuerpo !== 'object' || cuerpo === null || !('error' in cuerpo)) {
    return false;
  }
  const error: unknown = cuerpo.error;
  return (
    typeof error === 'object' &&
    error !== null &&
    'codigo' in error &&
    typeof error.codigo === 'string' &&
    'mensaje' in error &&
    typeof error.mensaje === 'string'
  );
}

function _esDetalle(valor: unknown): valor is DetalleError {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'campo' in valor &&
    typeof valor.campo === 'string' &&
    'mensaje' in valor &&
    typeof valor.mensaje === 'string'
  );
}

/** Campo del formulario que corresponde a cada finalidad de `CONSENTIMIENTO_REQUERIDO`. */
export const CAMPO_POR_FINALIDAD: Readonly<Record<string, string>> = {
  TRATAMIENTO: 'acepta_tratamiento',
  TRANSFERENCIA_INTERNACIONAL: 'acepta_transferencia_internacional',
  PERSONALIZACION: 'acepta_personalizacion',
  COMUNICACIONES: 'acepta_comunicaciones',
  OPINION_MENOR: 'entiende_datos_menor',
};

export const MENSAJE_CONSENTIMIENTO_FALTANTE = 'Debes marcar esta autorización para continuar.';

/** `{ finalidades: ['TRATAMIENTO'] }` → `[{ campo: 'acepta_tratamiento', mensaje }]` */
function _detallesDeFinalidades(detalles: unknown): DetalleError[] {
  if (typeof detalles !== 'object' || detalles === null || !('finalidades' in detalles)) {
    return [];
  }
  const finalidades: unknown = detalles.finalidades;
  return Array.isArray(finalidades)
    ? finalidades
        .filter((f): f is string => typeof f === 'string' && f in CAMPO_POR_FINALIDAD)
        .map((f) => ({
          campo: CAMPO_POR_FINALIDAD[f] ?? f,
          mensaje: MENSAJE_CONSENTIMIENTO_FALTANTE,
        }))
    : [];
}

function _normalizarDetalles(detalles: unknown): DetalleError[] | null {
  const validos = Array.isArray(detalles)
    ? detalles.filter(_esDetalle)
    : _detallesDeFinalidades(detalles);
  return validos.length > 0 ? validos : null;
}

/** `Retry-After` admite segundos o una fecha HTTP. */
function _segundosRetryAfter(valor: string | null, ahora = Date.now()): number | null {
  if (!valor) {
    return null;
  }
  const segundos = Number(valor.trim());
  if (Number.isFinite(segundos)) {
    return Math.max(0, Math.ceil(segundos));
  }
  const fecha = Date.parse(valor);
  return Number.isNaN(fecha) ? null : Math.max(0, Math.ceil((fecha - ahora) / 1000));
}

/** Convierte cualquier error de HttpClient en un `ApiError` tipado. */
export function mapearError(error: unknown): ApiError {
  if (!(error instanceof HttpErrorResponse)) {
    return {
      status: 0,
      codigo: 'ERROR_DESCONOCIDO',
      mensaje: MENSAJE_ERROR_GENERICO,
      detalles: null,
    };
  }
  if (error.status === 0) {
    return { status: 0, codigo: 'SIN_CONEXION', mensaje: MENSAJE_SIN_CONEXION, detalles: null };
  }
  const reintentar = _segundosRetryAfter(error.headers?.get('Retry-After') ?? null);
  const extra = reintentar === null ? {} : { reintentarEnSegundos: reintentar };
  if (_esCuerpoErrorApi(error.error)) {
    return {
      status: error.status,
      codigo: error.error.error.codigo,
      mensaje: error.error.error.mensaje,
      detalles: _normalizarDetalles(error.error.error.detalles),
      ...extra,
    };
  }
  return {
    status: error.status,
    codigo: 'ERROR_DESCONOCIDO',
    mensaje: MENSAJE_ERROR_GENERICO,
    detalles: null,
  };
}
