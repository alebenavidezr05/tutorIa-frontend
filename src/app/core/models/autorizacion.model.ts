import { FechaIso } from './comunes.model';

/**
 * Estado ya normalizado que usan las pantallas (ver `normalizarEstadoAutorizacion`).
 * `DESCONOCIDO`: el backend envió un valor que el frontend no reconoce.
 */
export type EstadoAutorizacion =
  | 'SIN_SOLICITUD'
  | 'PENDIENTE'
  | 'AUTORIZADA'
  | 'RECHAZADA'
  | 'REVOCADA'
  | 'EXPIRADA'
  | 'DESCONOCIDO';

/**
 * Valores que envía el backend: `EstadoAutorizacion` en las respuestas públicas del adulto
 * (PENDIENTE_VERIFICACION, VENCIDA…) y `EstadoAutorizacionEstudiante` en `/mia`.
 */
export type EstadoAutorizacionApi =
  | 'PENDIENTE_VERIFICACION'
  | 'VENCIDA'
  | 'SIN_SOLICITUD'
  | 'PENDIENTE'
  | 'AUTORIZADA'
  | 'RECHAZADA'
  | 'REVOCADA'
  | 'EXPIRADA';

/** Lo que ve el adulto responsable al abrir el enlace del correo (pantalla pública). */
export interface AutorizacionPublica {
  estado: EstadoAutorizacion;
  nombre_estudiante: string;
  correo_estudiante_enmascarado: string;
  /** Frase legal tal cual la redacta el backend: no se escribe a mano en el frontend. */
  texto_consentimiento: string;
  version_politica: string;
  fecha_expiracion_token: FechaIso;
}

/** Respuesta cruda de la API: el estado aún sin normalizar (puede ser cualquier texto). */
export type AutorizacionPublicaApi = Omit<AutorizacionPublica, 'estado'> & {
  estado: EstadoAutorizacionApi | string;
};

/** `GET /autorizaciones/mia`: estado de la autorización del estudiante con sesión. */
export interface MiAutorizacion {
  estado: EstadoAutorizacion;
  correo_acudiente_enmascarado: string | null;
  puede_reenviar_en_segundos: number;
}

export type MiAutorizacionApi = Omit<MiAutorizacion, 'estado'> & {
  estado: EstadoAutorizacionApi | string;
};

export interface ReenviarAutorizacionEntrada {
  correo_acudiente?: string;
}
