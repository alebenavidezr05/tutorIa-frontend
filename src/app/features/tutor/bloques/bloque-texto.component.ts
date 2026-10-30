import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BloqueTexto, FuentePublica } from '../../../core/models';
import { ESTILOS_BLOQUE } from './bloque.estilos';
import { FuentesBloqueComponent } from './fuentes-bloque.component';

@Component({
  selector: 'app-bloque-texto',
  imports: [FuentesBloqueComponent],
  template: `
    <p class="contenido">{{ bloque().contenido }}</p>
    <app-fuentes-bloque [fuentes]="fuentes()" />
  `,
  styles: ESTILOS_BLOQUE,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BloqueTextoComponent {
  readonly bloque = input.required<BloqueTexto>();
  readonly fuentes = input<readonly FuentePublica[]>([]);
}
