import { AristaDiagrama, NodoDiagrama, TipoDiagrama } from '../../../core/models';

export const ANCHO_NODO = 168;
export const ALTO_LINEA = 18;
export const RELLENO_NODO = 12;
export const SEPARACION_X = 32;
export const SEPARACION_Y = 64;
export const MARGEN = 24;
export const MAX_CARACTERES_LINEA = 18;
export const MAX_LINEAS = 4;

export interface NodoUbicado {
  readonly id: string;
  readonly texto: string;
  readonly lineas: readonly string[];
  /** Esquina superior izquierda. */
  readonly x: number;
  readonly y: number;
  readonly ancho: number;
  readonly alto: number;
  readonly cx: number;
  readonly cy: number;
  readonly principal: boolean;
}

export interface AristaUbicada {
  readonly id: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly etiqueta: string | null;
  readonly ex: number;
  readonly ey: number;
}

export interface LayoutDiagrama {
  readonly ancho: number;
  readonly alto: number;
  readonly nodos: readonly NodoUbicado[];
  readonly aristas: readonly AristaUbicada[];
  /** Alternativa textual: "A → B: etiqueta". */
  readonly descripcion: readonly string[];
}

interface NodoMedido {
  readonly id: string;
  readonly texto: string;
  readonly lineas: string[];
  readonly alto: number;
}

/** Corta un texto en líneas de hasta `max` caracteres (parte palabras muy largas). */
export function partirTexto(
  texto: string,
  max = MAX_CARACTERES_LINEA,
  maxLineas = MAX_LINEAS,
): string[] {
  const palabras = texto
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((p) => {
      const trozos: string[] = [];
      for (let i = 0; i < p.length; i += max) {
        trozos.push(p.slice(i, i + max));
      }
      return trozos;
    });
  const lineas: string[] = [];
  for (const palabra of palabras) {
    const ultima = lineas.at(-1);
    if (ultima !== undefined && `${ultima} ${palabra}`.length <= max) {
      lineas[lineas.length - 1] = `${ultima} ${palabra}`;
    } else {
      lineas.push(palabra);
    }
  }
  if (lineas.length > maxLineas) {
    const recortadas = lineas.slice(0, maxLineas);
    recortadas[maxLineas - 1] = `${(recortadas[maxLineas - 1] ?? '').slice(0, max - 1)}…`;
    return recortadas;
  }
  return lineas.length > 0 ? lineas : [''];
}

function _medir(nodo: NodoDiagrama): NodoMedido {
  const lineas = partirTexto(nodo.texto);
  return {
    id: nodo.id,
    texto: nodo.texto,
    lineas,
    alto: lineas.length * ALTO_LINEA + 2 * RELLENO_NODO,
  };
}

/** Quita nodos repetidos y aristas que apuntan a nodos inexistentes o a sí mismos. */
function _depurar(
  nodos: readonly NodoDiagrama[],
  aristas: readonly AristaDiagrama[],
): { nodos: NodoMedido[]; aristas: AristaDiagrama[] } {
  const vistos = new Set<string>();
  const unicos: NodoDiagrama[] = [];
  for (const nodo of nodos) {
    if (!vistos.has(nodo.id)) {
      vistos.add(nodo.id);
      unicos.push(nodo);
    }
  }
  const validas = aristas.filter(
    (a) => vistos.has(a.desde) && vistos.has(a.hasta) && a.desde !== a.hasta,
  );
  return { nodos: unicos.map(_medir), aristas: validas };
}

/**
 * Niveles por orden topológico (Kahn). Tolera ciclos: si la cola se vacía con nodos pendientes,
 * toma el primero pendiente (rompe el ciclo) y sigue. Los nodos aislados quedan en el nivel 0.
 */
export function asignarNiveles(
  ids: readonly string[],
  aristas: readonly AristaDiagrama[],
): Map<string, number> {
  const entrantes = new Map(ids.map((id) => [id, 0]));
  const salientes = new Map<string, string[]>(ids.map((id) => [id, []]));
  for (const a of aristas) {
    entrantes.set(a.hasta, (entrantes.get(a.hasta) ?? 0) + 1);
    salientes.get(a.desde)?.push(a.hasta);
  }
  const nivel = new Map(ids.map((id) => [id, 0]));
  const procesados = new Set<string>();
  const cola = ids.filter((id) => entrantes.get(id) === 0);

  while (procesados.size < ids.length) {
    const actual = cola.shift() ?? ids.find((id) => !procesados.has(id));
    if (actual === undefined) {
      break;
    }
    if (procesados.has(actual)) {
      continue;
    }
    procesados.add(actual);
    for (const destino of salientes.get(actual) ?? []) {
      if (procesados.has(destino)) {
        continue;
      }
      nivel.set(destino, Math.max(nivel.get(destino) ?? 0, (nivel.get(actual) ?? 0) + 1));
      const restantes = (entrantes.get(destino) ?? 1) - 1;
      entrantes.set(destino, restantes);
      if (restantes === 0) {
        cola.push(destino);
      }
    }
  }
  return nivel;
}

function _layoutFlujo(
  nodos: NodoMedido[],
  aristas: AristaDiagrama[],
): { ubicados: NodoUbicado[]; ancho: number; alto: number } {
  const niveles = asignarNiveles(
    nodos.map((n) => n.id),
    aristas,
  );
  const filas: NodoMedido[][] = [];
  for (const nodo of nodos) {
    const n = niveles.get(nodo.id) ?? 0;
    (filas[n] ??= []).push(nodo);
  }
  const filasLlenas = filas.filter((f) => f.length > 0);
  const anchoFila = (f: NodoMedido[]) => f.length * ANCHO_NODO + (f.length - 1) * SEPARACION_X;
  const anchoMaximo = Math.max(...filasLlenas.map(anchoFila));
  const ubicados: NodoUbicado[] = [];
  let y = MARGEN;
  for (const fila of filasLlenas) {
    const altoFila = Math.max(...fila.map((n) => n.alto));
    let x = MARGEN + (anchoMaximo - anchoFila(fila)) / 2;
    for (const nodo of fila) {
      const yNodo = y + (altoFila - nodo.alto) / 2;
      ubicados.push({
        ...nodo,
        x,
        y: yNodo,
        ancho: ANCHO_NODO,
        cx: x + ANCHO_NODO / 2,
        cy: yNodo + nodo.alto / 2,
        principal: false,
      });
      x += ANCHO_NODO + SEPARACION_X;
    }
    y += altoFila + SEPARACION_Y;
  }
  return { ubicados, ancho: anchoMaximo + 2 * MARGEN, alto: y - SEPARACION_Y + MARGEN };
}

function _principal(nodos: NodoMedido[], aristas: AristaDiagrama[]): string | undefined {
  const grado = new Map(nodos.map((n) => [n.id, 0]));
  for (const a of aristas) {
    grado.set(a.desde, (grado.get(a.desde) ?? 0) + 1);
    grado.set(a.hasta, (grado.get(a.hasta) ?? 0) + 1);
  }
  let mejor = nodos[0]?.id;
  for (const n of nodos) {
    if ((grado.get(n.id) ?? 0) > (grado.get(mejor ?? '') ?? 0)) {
      mejor = n.id;
    }
  }
  return mejor;
}

/** Disposición radial: el nodo con más conexiones al centro y el resto en círculo. */
function _layoutMapa(
  nodos: NodoMedido[],
  aristas: AristaDiagrama[],
): { ubicados: NodoUbicado[]; ancho: number; alto: number } {
  const idPrincipal = _principal(nodos, aristas);
  const resto = nodos.filter((n) => n.id !== idPrincipal);
  const altoMaximo = Math.max(...nodos.map((n) => n.alto));
  const separacion = Math.hypot(ANCHO_NODO, altoMaximo) + SEPARACION_X / 2;
  const radio =
    resto.length === 0
      ? 0
      : Math.max(ANCHO_NODO + SEPARACION_X, (resto.length * separacion) / (2 * Math.PI));
  const cx = MARGEN + radio + ANCHO_NODO / 2;
  const cy = MARGEN + radio + altoMaximo / 2;
  const ubicar = (nodo: NodoMedido, x: number, y: number, principal: boolean): NodoUbicado => ({
    ...nodo,
    x: x - ANCHO_NODO / 2,
    y: y - nodo.alto / 2,
    ancho: ANCHO_NODO,
    cx: x,
    cy: y,
    principal,
  });
  const ubicados = nodos.map((nodo) => {
    if (nodo.id === idPrincipal) {
      return ubicar(nodo, cx, cy, true);
    }
    const i = resto.indexOf(nodo);
    const angulo = -Math.PI / 2 + (2 * Math.PI * i) / resto.length;
    return ubicar(nodo, cx + radio * Math.cos(angulo), cy + radio * Math.sin(angulo), false);
  });
  return {
    ubicados,
    ancho: 2 * (radio + MARGEN) + ANCHO_NODO,
    alto: 2 * (radio + MARGEN) + altoMaximo,
  };
}

/** Punto donde la recta del centro de `n` hacia (tx, ty) cruza el borde del rectángulo. */
function _borde(n: NodoUbicado, tx: number, ty: number): { x: number; y: number } {
  const dx = tx - n.cx;
  const dy = ty - n.cy;
  if (dx === 0 && dy === 0) {
    return { x: n.cx, y: n.cy };
  }
  const escala = 1 / Math.max(Math.abs(dx) / (n.ancho / 2), Math.abs(dy) / (n.alto / 2));
  return { x: n.cx + dx * escala, y: n.cy + dy * escala };
}

function _ubicarAristas(ubicados: NodoUbicado[], aristas: AristaDiagrama[]): AristaUbicada[] {
  const porId = new Map(ubicados.map((n) => [n.id, n]));
  return aristas.flatMap((a, i) => {
    const desde = porId.get(a.desde);
    const hasta = porId.get(a.hasta);
    if (!desde || !hasta) {
      return [];
    }
    const p1 = _borde(desde, hasta.cx, hasta.cy);
    const p2 = _borde(hasta, desde.cx, desde.cy);
    return [
      {
        id: `${a.desde}-${a.hasta}-${i}`,
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
        etiqueta: a.etiqueta?.trim() || null,
        ex: (p1.x + p2.x) / 2,
        ey: (p1.y + p2.y) / 2,
      },
    ];
  });
}

function _describir(
  nodos: NodoMedido[],
  aristas: AristaDiagrama[],
  sinConexiones: string,
): string[] {
  const texto = new Map(nodos.map((n) => [n.id, n.texto]));
  const conectados = new Set(aristas.flatMap((a) => [a.desde, a.hasta]));
  return [
    ...aristas.map((a) => {
      const base = `${texto.get(a.desde) ?? a.desde} → ${texto.get(a.hasta) ?? a.hasta}`;
      return a.etiqueta?.trim() ? `${base}: ${a.etiqueta.trim()}` : base;
    }),
    ...nodos.filter((n) => !conectados.has(n.id)).map((n) => `${n.texto} (${sinConexiones})`),
  ];
}

const _redondear = (v: number) => Math.round(v * 10) / 10;

/**
 * Función pura: calcula posiciones de nodos y aristas para pintar el diagrama en SVG.
 * - `flujo`: niveles por orden topológico (de arriba abajo).
 * - `mapa_conceptual`: disposición radial.
 * Tolera ciclos, nodos aislados, ids repetidos y aristas inválidas.
 */
export function calcularLayoutDiagrama(
  nodosEntrada: readonly NodoDiagrama[],
  aristasEntrada: readonly AristaDiagrama[],
  tipo: TipoDiagrama = 'flujo',
  sinConexiones = 'sin conexiones',
): LayoutDiagrama {
  const { nodos, aristas } = _depurar(nodosEntrada, aristasEntrada);
  if (nodos.length === 0) {
    return { ancho: 2 * MARGEN, alto: 2 * MARGEN, nodos: [], aristas: [], descripcion: [] };
  }
  const { ubicados, ancho, alto } =
    tipo === 'mapa_conceptual' ? _layoutMapa(nodos, aristas) : _layoutFlujo(nodos, aristas);
  return {
    ancho: Math.ceil(ancho),
    alto: Math.ceil(alto),
    nodos: ubicados.map((n) => ({
      ...n,
      x: _redondear(n.x),
      y: _redondear(n.y),
      cx: _redondear(n.cx),
      cy: _redondear(n.cy),
    })),
    aristas: _ubicarAristas(ubicados, aristas),
    descripcion: _describir(nodos, aristas, sinConexiones),
  };
}
