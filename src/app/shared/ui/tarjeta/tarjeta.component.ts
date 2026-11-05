import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-tarjeta',
  template: `<ng-content />`,
  styles: `
    @use 'mixins' as *;

    :host {
      display: block;
      padding: var(--espacio-5) var(--espacio-4);
      border: 1px solid var(--color-borde-suave);
      border-radius: var(--radio-xl);
      background: var(--color-superficie);
      color: var(--color-texto);
      box-shadow: var(--sombra-suave);
      min-width: 0;

      @include desde(sm) {
        padding: var(--espacio-6);
      }
    }

    :host(.tarjeta--elevada) {
      box-shadow: var(--sombra-elevada);
    }

    :host(.tarjeta--destacada) {
      border-color: var(--color-acento);
      box-shadow:
        inset 0 0 0 1px var(--color-acento),
        var(--sombra-suave);
    }
  `,
  host: {
    '[class.tarjeta--elevada]': 'elevada()',
    '[class.tarjeta--destacada]': 'destacada()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarjetaComponent {
  readonly elevada = input(false);
  readonly destacada = input(false);
}
