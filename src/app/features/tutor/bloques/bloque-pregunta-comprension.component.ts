import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BloquePreguntaComprension } from '../../../core/models';
import { TEXTOS_BLOQUES } from '../tutor.textos';
import { ESTILOS_BLOQUE } from './bloque.estilos';

@Component({
  selector: 'app-bloque-pregunta-comprension',
  template: `
    <div class="recuadro">
      <p class="rotulo">{{ textos.pregunta }}</p>
      <p class="contenido">{{ bloque().enunciado }}</p>
    </div>
  `,
  styles: ESTILOS_BLOQUE,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BloquePreguntaComprensionComponent {
  readonly bloque = input.required<BloquePreguntaComprension>();
  protected readonly textos = TEXTOS_BLOQUES;
}
