/** Tipos de unión compartidos. Espejo de `app/models/enums.py` del backend. */

export type Uuid = string;
/** Fecha y hora ISO 8601 tal como la envía la API. */
export type FechaIso = string;

export type NivelCognitivo = 'BASICO' | 'INTERMEDIO' | 'AVANZADO';
export type TipoNivel = 'COLEGIO' | 'UNIVERSIDAD_TECNICA';
export type EstadoActividad = 'PENDIENTE' | 'COMPLETADA' | 'OMITIDA';
export type EstadoPlan = 'GENERADO' | 'EN_PROGRESO' | 'COMPLETADO';
export type EstadoCuenta = 'ACTIVA' | 'PENDIENTE_AUTORIZACION' | 'REVOCADA' | 'DESACTIVADA';

/** Opción enviada por el cliente (el backend la normaliza a mayúscula). */
export type OpcionLetra = 'a' | 'b' | 'c' | 'd';
/** Opción tal como la devuelve el backend en los resultados. */
export type OpcionRespuesta = 'A' | 'B' | 'C' | 'D';

export type Capacidad = 'HISTORIAL_COMPLETO' | 'REPORTE_PROGRESO' | 'TEMAS_SIMULTANEOS';
export type PlanSuscripcion = 'GRATUITO' | 'PREMIUM';
export type EstadoSuscripcion = 'ACTIVA' | 'VENCIDA' | 'CANCELADA';

export type Finalidad =
  | 'TRATAMIENTO'
  | 'TRANSFERENCIA_INTERNACIONAL'
  | 'PERSONALIZACION'
  | 'COMUNICACIONES'
  | 'COMPRAS_MENOR'
  | 'OPINION_MENOR';

export type ContextoArchivo = 'ACTIVIDAD' | 'CONVERSACION';

export interface Pagina<T> {
  items: T[];
  total: number;
  pagina: number;
  tamano: number;
}
