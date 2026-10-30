import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BloqueEjemplo, FuentePublica } from '../../../core/models';
import { TEXTOS_BLOQUES } from '../tutor.textos';
import { ESTILOS_BLOQUE } from './bloque.estilos';
import { FuentesBloqueComponent } from './fuentes-bloque.component';

@Component({
  selector: 'app-bloque-ejemplo',
  imports: [FuentesBloqueComponent],
  template: `
    <div class="recuadro">
      <p class="rotulo">{{ textos.ejemplo }}</p>
      <h4>{{ bloque().titulo }}</h4>
      <p class="contenido">{{ bloque().contenido }}</p>
    </div>
    <app-fuentes-bloque [fuentes]="fuentes()" />
  `,
  styles: ESTILOS_BLOQUE,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BloqueEjemploComponent {
  readonly bloque = input.required<BloqueEjemplo>();
  readonly fuentes = input<readonly FuentePublica[]>([]);
  protected readonly textos = TEXTOS_BLOQUES;
}
