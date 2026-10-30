import { Capacidad, EstadoSuscripcion, FechaIso, PlanSuscripcion } from './comunes.model';

export interface LimitesPublicos {
  mensajes_restantes_hoy: number;
  planes_restantes_hoy: number;
  imagenes_ia_restantes_hoy: number;
  busquedas_video_restantes_hoy: number;
  archivos_restantes_hoy: number;
}

export interface SuscripcionPublica {
  plan: PlanSuscripcion;
  estado: EstadoSuscripcion;
  fecha_inicio: FechaIso;
  fecha_fin: FechaIso | null;
  capacidades: Capacidad[];
  limites: LimitesPublicos;
}

export interface CheckoutPublico {
  url_pago: string;
}
