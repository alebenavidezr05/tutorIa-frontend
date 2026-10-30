import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-tarjeta',
  template: `<ng-content />`,
  styles: `
    @use 'mixins' as *;

    :host {
      display: block;
      padding: var(--espacio-4);
      border: 1px solid var(--color-borde);
      border-radius: var(--radio-lg);
      background: var(--color-superficie);
      color: var(--color-texto);
      min-width: 0;

      @include desde(sm) {
        padding: var(--espacio-5);
      }
    }

    :host(.tarjeta--elevada) {
      box-shadow: var(--sombra-suave);
    }

    :host(.tarjeta--destacada) {
      border: 2px solid var(--color-acento);
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
