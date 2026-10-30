import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  template: `
    <span class="spinner" aria-hidden="true"></span>
    <span [class.visualmente-oculto]="!etiquetaVisible()">{{ etiqueta() }}</span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--espacio-3);
      color: var(--color-texto);
    }

    .spinner {
      width: 28px;
      height: 28px;
      border: 3px solid var(--color-borde-control);
      border-top-color: var(--color-acento);
      border-radius: 50%;
      animation: girar 0.9s linear infinite;
    }

    @keyframes girar {
      to {
        transform: rotate(360deg);
      }
    }
  `,
  host: { role: 'status', 'aria-live': 'polite' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {
  readonly etiqueta = input('Cargando…');
  readonly etiquetaVisible = input(true);
}
