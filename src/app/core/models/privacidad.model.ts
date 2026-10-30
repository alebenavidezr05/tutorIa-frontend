import { FechaIso, Finalidad, Uuid } from './comunes.model';

export type OtorgadoPor = 'TITULAR' | 'REPRESENTANTE_LEGAL';
export type TipoSolicitud = 'CONSULTA' | 'RECLAMO' | 'RECTIFICACION' | 'SUPRESION' | 'REVOCATORIA';
export type EstadoSolicitud = 'RECIBIDA' | 'EN_TRAMITE' | 'RESPONDIDA' | 'RECHAZADA';

export interface ResponsablePublico {
  razon_social: string;
  nit: string;
  domicilio: string;
  correo_datos: string;
}

export interface FinalidadPublica {
  finalidad: Finalidad;
  obligatoria: boolean;
  /** Texto legal exacto que se muestra junto a la casilla. */
  texto: string;
}

export interface PoliticaPublica {
  version: string;
  /** Markdown simple; se muestra como texto plano por secciones (sin innerHTML). */
  texto: string;
  responsable: ResponsablePublico;
  finalidades: FinalidadPublica[];
  vigente_desde: string;
}

export interface ConsentimientoPublico {
  finalidad: Finalidad;
  otorgado: boolean;
  otorgado_por: OtorgadoPor;
  version_politica: string;
  fecha: FechaIso;
}

export interface CambioConsentimientoEntrada {
  finalidad: Finalidad;
  otorgado: boolean;
  version_politica: string;
}

export interface AceptarPoliticaEntrada {
  version_politica: string;
  acepta_tratamiento: boolean;
  acepta_transferencia_internacional: boolean;
}

export interface SolicitudEntrada {
  tipo: TipoSolicitud;
  detalle: string;
}

export interface SolicitudPublica {
  id_solicitud: Uuid;
  tipo: TipoSolicitud;
  estado: EstadoSolicitud;
  /** AAAA-MM-DD */
  fecha_limite: string;
}

export type RegistroDatos = Record<string, unknown>;

export interface MisDatos {
  usuario: RegistroDatos;
  perfil_aprendizaje: RegistroDatos;
  planes: RegistroDatos[];
  conversaciones: RegistroDatos[];
  archivos: RegistroDatos[];
  consentimientos: ConsentimientoPublico[];
  solicitudes: SolicitudPublica[];
}

export interface ProveedorDatos {
  nombre: string;
  datos_enviados: string;
  finalidad: string;
}

export interface CumplimientoPublico {
  proveedores: ProveedorDatos[];
  edad_minima: number;
  retencion_dias: Record<string, number>;
  contacto: string;
}
