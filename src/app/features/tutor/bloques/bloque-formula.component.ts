import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BloqueFormula, FuentePublica } from '../../../core/models';
import { FormulaKatexPipe } from '../../../shared/pipes/formula-katex.pipe';
import { TEXTOS_BLOQUES } from '../tutor.textos';
import { FuentesBloqueComponent } from './fuentes-bloque.component';

/**
 * La fórmula pasa SOLO por FormulaKatexPipe (excepción documentada). KaTeX genera además MathML
 * para lectores de pantalla; la descripción se muestra como texto debajo.
 */
@Component({
  selector: 'app-bloque-formula',
  imports: [FormulaKatexPipe, FuentesBloqueComponent],
  template: `
    <div class="formula" tabindex="0" role="group" [attr.aria-label]="textos.formula">
      <div [innerHTML]="bloque().latex | formulaKatex"></div>
    </div>
    <p class="descripcion">{{ bloque().descripcion }}</p>
    <app-fuentes-bloque [fuentes]="fuentes()" />
  `,
  styles: `
    :host {
      display: block;
    }

    /* Las fórmulas largas se desplazan dentro de su caja, nunca la página. */
    .formula {
      max-width: 100%;
      overflow-x: auto;
      padding: var(--espacio-2) var(--espacio-3);
      border: 1px solid var(--color-borde);
      border-radius: var(--radio-md);
      background: var(--color-fondo);
      color: var(--color-texto);
    }

    .descripcion {
      margin-top: var(--espacio-2);
      color: var(--color-texto-suave);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BloqueFormulaComponent {
  readonly bloque = input.required<BloqueFormula>();
  readonly fuentes = input<readonly FuentePublica[]>([]);
  protected readonly textos = TEXTOS_BLOQUES;
}
