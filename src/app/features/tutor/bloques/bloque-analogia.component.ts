import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BloqueAnalogia, FuentePublica } from '../../../core/models';
import { TEXTOS_BLOQUES } from '../tutor.textos';
import { ESTILOS_BLOQUE } from './bloque.estilos';
import { FuentesBloqueComponent } from './fuentes-bloque.component';

@Component({
  selector: 'app-bloque-analogia',
  imports: [FuentesBloqueComponent],
  template: `
    <div class="recuadro">
      <p class="rotulo">{{ textos.analogia }}</p>
      <p class="contenido">{{ bloque().contenido }}</p>
    </div>
    <app-fuentes-bloque [fuentes]="fuentes()" />
  `,
  styles: ESTILOS_BLOQUE,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BloqueAnalogiaComponent {
  readonly bloque = input.required<BloqueAnalogia>();
  readonly fuentes = input<readonly FuentePublica[]>([]);
  protected readonly textos = TEXTOS_BLOQUES;
}
