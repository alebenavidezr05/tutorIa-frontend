import { Uuid } from './comunes.model';

export type TipoFuente = 'TEXTO' | 'IMAGEN' | 'VIDEO';
export type CategoriaFuente =
  | 'ACADEMICA_ABIERTA'
  | 'INSTITUCIONAL_OFICIAL'
  | 'EDUCATIVA_ABIERTA'
  | 'REFERENCIA'
  | 'PRENSA_CONFIABLE'
  | 'CURADA'
  | 'WEB_GENERAL';

export interface FuentePublica {
  id_fuente: Uuid;
  tipo: TipoFuente;
  categoria: CategoriaFuente;
  titulo: string;
  sitio: string;
  url: string;
  autor: string | null;
  doi: string | null;
  licencia: string | null;
}

/** Referencia en formato APA 7 lista para mostrar. */
export interface ReferenciaPublica {
  id_fuente?: Uuid | null;
  id_recurso?: Uuid | null;
  id_video?: Uuid | null;
  tipo: string;
  texto_apa: string;
  url: string | null;
}
