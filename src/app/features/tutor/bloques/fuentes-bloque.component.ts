import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { FuentePublica } from '../../../core/models';
import { ListaReferenciasComponent } from '../../../shared/ui/lista-referencias/lista-referencias.component';
import { fuenteAReferencia } from '../../../shared/utils/referencias';
import { TEXTOS_BLOQUES } from '../tutor.textos';

let contador = 0;

/** Botón "Fuentes" que despliega las fuentes de un bloque. Sin fuentes, no se muestra nada. */
@Component({
  selector: 'app-fuentes-bloque',
  imports: [ListaReferenciasComponent],
  template: `
    @if (fuentes().length > 0) {
      <button
        type="button"
        class="fuentes__boton"
        [attr.aria-expanded]="abierto()"
        [attr.aria-controls]="idLista"
        (click)="abierto.set(!abierto())"
      >
        {{ abierto() ? textos.ocultarFuentes : etiqueta() }}
      </button>
      <div [id]="idLista" [hidden]="!abierto()">
        <app-lista-referencias [referencias]="referencias()" />
      </div>
    }
  `,
  styles: `
    .fuentes__boton {
      min-height: var(--objetivo-tactil);
      padding: var(--espacio-1) var(--espacio-3);
      border: 1px solid var(--color-borde-control);
      border-radius: var(--radio-pildora);
      background: transparent;
      color: var(--color-texto);
      font-size: var(--texto-sm);
      font-weight: 700;
      cursor: pointer;
    }

    div {
      margin-top: var(--espacio-2);
      font-size: var(--texto-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FuentesBloqueComponent {
  readonly fuentes = input.required<readonly FuentePublica[]>();

  protected readonly textos = TEXTOS_BLOQUES;
  protected readonly idLista = `fuentes-bloque-${++contador}`;
  protected readonly abierto = signal(false);
  protected readonly referencias = computed(() => this.fuentes().map(fuenteAReferencia));
  protected readonly etiqueta = computed(() => this.textos.fuentes(this.fuentes().length));
}
