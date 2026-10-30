import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BloquePasos, FuentePublica } from '../../../core/models';
import { ESTILOS_BLOQUE } from './bloque.estilos';
import { FuentesBloqueComponent } from './fuentes-bloque.component';

@Component({
  selector: 'app-bloque-pasos',
  imports: [FuentesBloqueComponent],
  template: `
    <h4>{{ bloque().titulo }}</h4>
    <ol>
      @for (paso of bloque().pasos; track $index) {
        <li>{{ paso }}</li>
      }
    </ol>
    <app-fuentes-bloque [fuentes]="fuentes()" />
  `,
  styles: ESTILOS_BLOQUE,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BloquePasosComponent {
  readonly bloque = input.required<BloquePasos>();
  readonly fuentes = input<readonly FuentePublica[]>([]);
}
