import { AristaDiagrama, NodoDiagrama } from '../../../core/models';
import {
  NodoUbicado,
  asignarNiveles,
  calcularLayoutDiagrama,
  partirTexto,
} from './calcular-layout-diagrama';

function nodos(n: number): NodoDiagrama[] {
  return Array.from({ length: n }, (_, i) => ({ id: `n${i}`, texto: `Concepto número ${i}` }));
}

function seSolapan(a: NodoUbicado, b: NodoUbicado): boolean {
  return a.x < b.x + b.ancho && b.x < a.x + a.ancho && a.y < b.y + b.alto && b.y < a.y + a.alto;
}

function sinSolapes(lista: readonly NodoUbicado[]): boolean {
  return lista.every((a, i) => lista.slice(i + 1).every((b) => !seSolapan(a, b)));
}

function dentroDelLienzo(layout: ReturnType<typeof calcularLayoutDiagrama>): boolean {
  return layout.nodos.every(
    (n) => n.x >= 0 && n.y >= 0 && n.x + n.ancho <= layout.ancho && n.y + n.alto <= layout.alto,
  );
}

describe('calcularLayoutDiagrama', () => {
  it('flujo: asigna niveles por orden topológico', () => {
    const aristas: AristaDiagrama[] = [
      { desde: 'a', hasta: 'b' },
      { desde: 'b', hasta: 'c' },
      { desde: 'a', hasta: 'c' },
    ];
    const niveles = asignarNiveles(['a', 'b', 'c'], aristas);
    expect([niveles.get('a'), niveles.get('b'), niveles.get('c')]).toEqual([0, 1, 2]);

    const layout = calcularLayoutDiagrama(
      [
        { id: 'a', texto: 'A' },
        { id: 'b', texto: 'B' },
        { id: 'c', texto: 'C' },
      ],
      aristas,
      'flujo',
    );
    const [a, b, c] = layout.nodos;
    expect(a && b && c && a.y < b.y && b.y < c.y).toBe(true);
    expect(layout.aristas).toHaveLength(3);
  });

  it('tolera ciclos sin colgarse', () => {
    const layout = calcularLayoutDiagrama(
      nodos(3),
      [
        { desde: 'n0', hasta: 'n1' },
        { desde: 'n1', hasta: 'n2' },
        { desde: 'n2', hasta: 'n0' },
      ],
      'flujo',
    );
    expect(layout.nodos).toHaveLength(3);
    expect(sinSolapes(layout.nodos)).toBe(true);
    expect(dentroDelLienzo(layout)).toBe(true);
  });

  it('incluye nodos aislados y los describe en el texto alternativo', () => {
    const layout = calcularLayoutDiagrama(
      [
        { id: 'a', texto: 'Sol' },
        { id: 'b', texto: 'Tierra' },
        { id: 'c', texto: 'Plutón' },
      ],
      [{ desde: 'a', hasta: 'b', etiqueta: 'ilumina' }],
      'mapa_conceptual',
    );
    expect(layout.nodos).toHaveLength(3);
    expect(layout.descripcion).toEqual(['Sol → Tierra: ilumina', 'Plutón (sin conexiones)']);
  });

  it('ignora aristas inválidas, bucles e ids repetidos', () => {
    const layout = calcularLayoutDiagrama(
      [
        { id: 'a', texto: 'A' },
        { id: 'a', texto: 'A otra vez' },
        { id: 'b', texto: 'B' },
      ],
      [
        { desde: 'a', hasta: 'zzz' },
        { desde: 'a', hasta: 'a' },
        { desde: 'a', hasta: 'b' },
      ],
    );
    expect(layout.nodos).toHaveLength(2);
    expect(layout.aristas).toHaveLength(1);
  });

  it.each(['flujo', 'mapa_conceptual'] as const)(
    '%s con 12 nodos: sin solapes y dentro del lienzo',
    (tipo) => {
      const lista = nodos(12);
      const aristas = lista
        .slice(1)
        .map((n, i) => ({ desde: i % 3 === 0 ? 'n0' : `n${i}`, hasta: n.id }));
      const layout = calcularLayoutDiagrama(lista, aristas, tipo);
      expect(layout.nodos).toHaveLength(12);
      expect(sinSolapes(layout.nodos)).toBe(true);
      expect(dentroDelLienzo(layout)).toBe(true);
    },
  );

  it('mapa conceptual: el nodo con más conexiones va al centro como principal', () => {
    const layout = calcularLayoutDiagrama(
      nodos(5),
      ['n1', 'n2', 'n3', 'n4'].map((id) => ({ desde: 'n2', hasta: id === 'n2' ? 'n0' : id })),
      'mapa_conceptual',
    );
    const principal = layout.nodos.find((n) => n.principal);
    expect(principal?.id).toBe('n2');
    expect(principal?.cx).toBeCloseTo(layout.ancho / 2, 0);
  });

  it('lista vacía', () => {
    expect(calcularLayoutDiagrama([], []).nodos).toEqual([]);
  });

  it('partirTexto corta en líneas y recorta con elipsis', () => {
    expect(partirTexto('Evaporación del agua de los océanos', 18)).toEqual([
      'Evaporación del',
      'agua de los',
      'océanos',
    ]);
    expect(partirTexto('x'.repeat(100), 10, 2)).toEqual(['x'.repeat(10), `${'x'.repeat(9)}…`]);
  });
});
