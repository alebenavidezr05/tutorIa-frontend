import { FechaIso, NivelCognitivo, Pagina, Uuid } from './comunes.model';

export interface ItemHistorial {
  id_sesion: Uuid;
  id_plan: Uuid;
  tema: string;
  nivel_estimado: NivelCognitivo | null;
  fecha: FechaIso;
}

export interface HistorialPagina extends Pagina<ItemHistorial> {
  /** `true` en el plan gratuito: hay más historial que no se muestra. */
  limitado: boolean;
}
