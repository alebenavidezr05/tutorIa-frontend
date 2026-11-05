import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { VexComponent } from '../vex/vex.component';

/**
 * Indicador de carga. Con `conVex` muestra a Vex pensando (carga de página completa); sin él,
 * un aro discreto para cargas dentro de un formulario o una tarjeta.
 */
@Component({
  selector: 'app-spinner',
  imports: [VexComponent],
  template: `
    @if (conVex()) {
      <app-vex estado="pensando" tamano="md" [decorativo]="true" [flotante]="true" />
    } @else {
      <span class="spinner" aria-hidden="true"></span>
    }
    <span [class.visualmente-oculto]="!etiquetaVisible()">{{ etiqueta() }}</span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--espacio-3);
      color: var(--color-texto);
    }

    :host(.spinner--vex) {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding-block: var(--espacio-7);
      font-weight: 600;
      text-align: center;
    }

    .spinner {
      width: 28px;
      height: 28px;
      border: 3px solid var(--color-borde);
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
  host: { role: 'status', 'aria-live': 'polite', '[class.spinner--vex]': 'conVex()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {
  readonly etiqueta = input('Cargando…');
  readonly etiquetaVisible = input(true);
  readonly conVex = input(false);
}
