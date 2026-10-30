import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { formatearDuracion, duracionLegible } from './duracion.pipe';
import { FormulaKatexPipe } from './formula-katex.pipe';
import { formatearTamano } from './tamano-archivo.pipe';
import { YoutubeEmbedUrlPipe } from './youtube-embed-url.pipe';

function html(valor: unknown): string {
  // SafeHtml de Angular expone el valor en changingThisBreaksApplicationSecurity.
  return (valor as { changingThisBreaksApplicationSecurity: string })
    .changingThisBreaksApplicationSecurity;
}

describe('FormulaKatexPipe', () => {
  let pipe: FormulaKatexPipe;

  beforeEach(() => {
    pipe = TestBed.runInInjectionContext(() => new FormulaKatexPipe());
  });

  it('renderiza LaTeX válido con KaTeX (incluye MathML accesible)', () => {
    const salida = html(pipe.transform('\\frac{a}{b}'));
    expect(salida).toContain('katex');
    expect(salida).toContain('<math');
  });

  it('con LaTeX inválido muestra el texto crudo sin lanzar error', () => {
    const salida = html(pipe.transform('\\frac{a'));
    expect(salida).toContain('katex-error');
    expect(salida).toContain('\\frac{a');
  });

  it('con trust: false no genera enlaces ni recursos externos', () => {
    const salida = html(
      pipe.transform('\\href{javascript:alert(1)}{x} \\includegraphics{https://evil.com/a.png}'),
    );
    expect(salida).not.toContain('href="javascript');
    expect(salida).not.toContain('<img');
  });

  it('escapa HTML incrustado', () => {
    const salida = html(pipe.transform('<script>alert(1)</script>'));
    expect(salida).not.toContain('<script>');
  });
});

describe('YoutubeEmbedUrlPipe', () => {
  let pipe: YoutubeEmbedUrlPipe;

  beforeEach(() => {
    pipe = TestBed.runInInjectionContext(() => new YoutubeEmbedUrlPipe());
  });

  it('construye la URL de youtube-nocookie con un id válido', () => {
    const url = pipe.transform('dQw4w9WgXcQ');
    expect(url).not.toBeNull();
    expect(TestBed.inject(DomSanitizer).sanitize(5, url)).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0',
    );
  });

  it('con un id inválido devuelve null', () => {
    expect(pipe.transform('abc')).toBeNull();
    expect(pipe.transform('dQw4w9WgXcQ?autoplay=1')).toBeNull();
    expect(pipe.transform('../../evil1')).toBeNull();
    expect(pipe.transform(null)).toBeNull();
  });
});

describe('formatos', () => {
  it('formatearDuracion y duracionLegible', () => {
    expect(formatearDuracion(245)).toBe('4:05');
    expect(formatearDuracion(3725)).toBe('1:02:05');
    expect(duracionLegible(61)).toBe('1 minuto y 1 segundo');
  });

  it('formatearTamano', () => {
    expect(formatearTamano(512)).toBe('512 B');
    expect(formatearTamano(2048)).toBe('2 KB');
    expect(formatearTamano(5_242_880)).toBe('5,0 MB');
  });
});
