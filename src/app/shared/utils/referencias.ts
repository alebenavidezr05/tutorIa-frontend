import { CategoriaFuente, FuentePublica, ReferenciaPublica } from '../../core/models';

/** Lo que pinta `ListaReferenciasComponent`. */
export interface ReferenciaVista {
  readonly id: string;
  readonly texto: string;
  readonly url: string | null;
  readonly rotulo: string | null;
  readonly doi: string | null;
  readonly detalle: string | null;
}

/** Rótulo de tipo en texto: nunca se comunica solo con color. */
export const ROTULO_CATEGORIA_FUENTE: Record<CategoriaFuente, string> = {
  ACADEMICA_ABIERTA: 'Artículo académico',
  INSTITUCIONAL_OFICIAL: 'Fuente oficial',
  EDUCATIVA_ABIERTA: 'Material educativo',
  REFERENCIA: 'Obra de referencia',
  PRENSA_CONFIABLE: 'Nota de prensa',
  CURADA: 'Recurso revisado por TutorIA',
  WEB_GENERAL: 'Sitio web',
};

/** Rótulo genérico para categorías que el frontend aún no conoce. */
export const ROTULO_FUENTE_GENERICO = 'Fuente';

export function rotuloCategoriaFuente(categoria: string | null | undefined): string {
  return categoria && Object.hasOwn(ROTULO_CATEGORIA_FUENTE, categoria)
    ? ROTULO_CATEGORIA_FUENTE[categoria as CategoriaFuente]
    : ROTULO_FUENTE_GENERICO;
}

export function urlExternaSegura(url: string | null | undefined): string | null {
  return url && /^https?:\/\//i.test(url) ? url : null;
}

function _urlDoi(doi: string | null): string | null {
  if (!doi) {
    return null;
  }
  const limpio = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').trim();
  return /^10\.\d{4,9}\/\S+$/.test(limpio) ? `https://doi.org/${limpio}` : null;
}

export function fuenteAReferencia(fuente: FuentePublica): ReferenciaVista {
  const detalle = [
    fuente.autor,
    fuente.sitio,
    fuente.licencia ? `Licencia: ${fuente.licencia}` : null,
  ]
    .filter((parte): parte is string => !!parte)
    .join(' · ');
  return {
    id: fuente.id_fuente,
    texto: fuente.titulo,
    url: urlExternaSegura(fuente.url),
    rotulo: rotuloCategoriaFuente(fuente.categoria),
    doi: _urlDoi(fuente.doi),
    detalle: detalle || null,
  };
}

export function referenciaApaAVista(
  referencia: ReferenciaPublica,
  indice: number,
): ReferenciaVista {
  return {
    id: referencia.id_fuente ?? referencia.id_recurso ?? referencia.id_video ?? `ref-${indice}`,
    texto: referencia.texto_apa,
    url: urlExternaSegura(referencia.url),
    rotulo: null,
    doi: null,
    detalle: null,
  };
}

/** Texto plano para copiar las referencias al portapapeles. */
export function referenciasComoTexto(referencias: readonly ReferenciaPublica[]): string {
  return referencias.map((r) => r.texto_apa).join('\n\n');
}
