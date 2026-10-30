import { EstadoActividad, EstadoPlan, FechaIso, NivelCognitivo, Uuid } from './comunes.model';
import { FuentePublica } from './fuente.model';

export interface ArchivoPublico {
  id_archivo: Uuid;
  nombre: string;
  mime: string;
  tamano_bytes: number;
}

export interface ActividadPublica {
  id_actividad: Uuid;
  numero_orden: number;
  enunciado: string;
  respuesta_usuario: string | null;
  archivo: ArchivoPublico | null;
  estado: EstadoActividad;
  fecha_completado: FechaIso | null;
}

export interface ActualizarActividadEntrada {
  estado: EstadoActividad;
  respuesta_usuario?: string | null;
  id_archivo?: Uuid | null;
}

export interface PlanDetalle {
  id_plan: Uuid;
  id_sesion: Uuid;
  titulo: string;
  explicacion: string;
  tecnicas_estudio: string[];
  nivel_bloom: NivelCognitivo;
  validado: boolean;
  estado: EstadoPlan;
  fecha_generacion: FechaIso;
  actividades: ActividadPublica[];
  fuentes: FuentePublica[];
  /** `true` solo en el nivel Avanzado. Lo decide el backend. */
  acepta_archivos: boolean;
}

/** Evento de una subida multipart con progreso. */
export type EventoSubida =
  { tipo: 'progreso'; porcentaje: number } | { tipo: 'completado'; archivo: ArchivoPublico };
