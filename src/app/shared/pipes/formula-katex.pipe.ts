import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { renderToString } from 'katex';

const LONGITUD_MAX_LATEX = 300;

/**
 * EXCEPCIÓN DOCUMENTADA 1 de 2 a la regla "nunca bypassSecurityTrust*" (§2.9).
 *
 * Por qué es seguro:
 * - Recibe ÚNICAMENTE una cadena LaTeX (el campo `latex` de un bloque `formula`), nunca HTML.
 * - El HTML lo genera KaTeX, no el modelo ni el backend.
 * - `trust: false` desactiva \href, \url, \htmlClass, \includegraphics y demás comandos que
 *   podrían crear enlaces, atributos o recursos externos.
 * - `throwOnError: false`: con LaTeX inválido KaTeX devuelve el texto crudo escapado
 *   (`<span class="katex-error">`), sin romper la pantalla.
 * - `maxSize`/`maxExpand` limitan expresiones abusivas.
 * Angular no puede sanear el MathML/estilos de KaTeX sin romperlos; por eso se marca como confiable
 * solo esta salida concreta.
 */
@Pipe({ name: 'formulaKatex' })
export class FormulaKatexPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(latex: string | null | undefined): SafeHtml {
    const fuente = (latex ?? '').slice(0, LONGITUD_MAX_LATEX);
    const html = renderToString(fuente, {
      throwOnError: false,
      trust: false,
      strict: 'ignore',
      displayMode: true,
      output: 'htmlAndMathml',
      errorColor: 'currentColor',
      maxSize: 10,
      maxExpand: 500,
    });
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
