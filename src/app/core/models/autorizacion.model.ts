import { FechaIso } from './comunes.model';

/** Espejo de `EstadoAutorizacion` del backend. */
export type EstadoAutorizacion =
  'SIN_SOLICITUD' | 'PENDIENTE' | 'AUTORIZADA' | 'RECHAZADA' | 'REVOCADA' | 'EXPIRADA';

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

/** `GET /autorizaciones/mia`: estado de la autorización del estudiante con sesión. */
export interface MiAutorizacion {
  estado: EstadoAutorizacion;
  correo_acudiente_enmascarado: string | null;
  puede_reenviar_en_segundos: number;
}

export interface ReenviarAutorizacionEntrada {
  correo_acudiente?: string;
}
