import { FechaIso } from './comunes.model';

/** Espejo de `EstadoAutorizacion` del backend. */
export type EstadoAutorizacion = 'PENDIENTE_VERIFICACION' | 'AUTORIZADA' | 'REVOCADA' | 'VENCIDA';

export interface AutorizacionPublica {
  estado: EstadoAutorizacion;
  correo_estudiante_enmascarado: string;
  permite_compras: boolean;
  fecha_expiracion_token: FechaIso;
}

export interface SolicitudAutorizacionEntrada {
  correo_acudiente: string;
  correo_estudiante: string;
  declara_representante_legal: boolean;
  version_politica: string;
  acepta_tratamiento: boolean;
  acepta_transferencia_internacional: boolean;
  permite_compras?: boolean;
}

export interface MensajeGenerico {
  mensaje: string;
}
