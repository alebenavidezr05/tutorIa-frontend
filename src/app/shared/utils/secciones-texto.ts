/** Sección de un texto legal lista para pintar con plantillas (sin innerHTML). */
export interface SeccionTexto {
  readonly titulo: string | null;
  readonly nivel: 1 | 2;
  readonly bloques: readonly BloqueSeccion[];
}

export type BloqueSeccion =
  | { readonly tipo: 'parrafo'; readonly texto: string }
  | { readonly tipo: 'nota'; readonly texto: string }
  | { readonly tipo: 'lista'; readonly items: readonly string[] };

function _limpiar(linea: string): string {
  return linea
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

interface Acumulador {
  secciones: { titulo: string | null; nivel: 1 | 2; bloques: BloqueSeccion[] }[];
  parrafo: string[];
  lista: string[];
}

function _cerrarParrafo(acc: Acumulador): void {
  const actual = acc.secciones.at(-1);
  if (actual && acc.parrafo.length > 0) {
    actual.bloques.push({ tipo: 'parrafo', texto: acc.parrafo.join(' ') });
  }
  acc.parrafo = [];
}

function _cerrarLista(acc: Acumulador): void {
  const actual = acc.secciones.at(-1);
  if (actual && acc.lista.length > 0) {
    actual.bloques.push({ tipo: 'lista', items: acc.lista });
  }
  acc.lista = [];
}

function _procesarLinea(acc: Acumulador, linea: string): void {
  const titulo = /^(#{1,3})\s+(.*)$/.exec(linea);
  if (titulo) {
    _cerrarParrafo(acc);
    _cerrarLista(acc);
    acc.secciones.push({
      titulo: _limpiar(titulo[2] ?? ''),
      nivel: (titulo[1] ?? '').length === 1 ? 1 : 2,
      bloques: [],
    });
    return;
  }
  const item = /^\s*[-*]\s+(.*)$/.exec(linea);
  if (item) {
    _cerrarParrafo(acc);
    acc.lista.push(_limpiar(item[1] ?? ''));
    return;
  }
  const nota = /^>\s?(.*)$/.exec(linea);
  if (nota) {
    _cerrarParrafo(acc);
    _cerrarLista(acc);
    acc.secciones.at(-1)?.bloques.push({ tipo: 'nota', texto: _limpiar(nota[1] ?? '') });
    return;
  }
  if (linea.trim() === '') {
    _cerrarParrafo(acc);
    _cerrarLista(acc);
    return;
  }
  _cerrarLista(acc);
  acc.parrafo.push(_limpiar(linea));
}

/**
 * Divide un texto con formato Markdown simple (títulos `#`, listas `-`, notas `>`) en secciones
 * de texto plano. Cualquier otra marca se muestra tal cual, como texto.
 */
export function dividirEnSecciones(texto: string): SeccionTexto[] {
  const acc: Acumulador = {
    secciones: [{ titulo: null, nivel: 2, bloques: [] }],
    parrafo: [],
    lista: [],
  };
  for (const linea of texto.split(/\r?\n/)) {
    _procesarLinea(acc, linea);
  }
  _cerrarParrafo(acc);
  _cerrarLista(acc);
  return acc.secciones.filter((s) => s.titulo !== null || s.bloques.length > 0);
}
