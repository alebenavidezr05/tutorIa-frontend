export type EstadoVisual = 'NO_NECESARIO' | 'PENDIENTE' | 'PROCESANDO' | 'LISTO' | 'FALLIDO';
export type TipoVisual = 'REAL' | 'DIAGRAMA' | 'IA';
export type TipoDiagrama = 'flujo' | 'mapa_conceptual';

export interface ImagenPublica {
  /** Ruta servida por la propia API (el backend copia la imagen). */
  url: string;
  texto_alternativo: string;
  pie: string;
  autor: string | null;
  licencia: string | null;
  url_licencia: string | null;
  url_origen: string | null;
  proveedor: string | null;
}

export interface NodoDiagrama {
  id: string;
  texto: string;
}

export interface AristaDiagrama {
  desde: string;
  hasta: string;
  etiqueta?: string | null;
}

export interface Diagrama {
  tipo_diagrama: TipoDiagrama;
  titulo: string;
  nodos: NodoDiagrama[];
  aristas: AristaDiagrama[];
}

export interface VisualPublico {
  estado: EstadoVisual;
  tipo: TipoVisual | null;
  imagen: ImagenPublica | null;
  diagrama: Diagrama | null;
  generado_por_ia: boolean;
  aviso_ia: string | null;
}
