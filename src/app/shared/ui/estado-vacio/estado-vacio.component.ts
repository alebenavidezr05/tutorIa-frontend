import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-estado-vacio',
  template: `
    <span class="estado-vacio__adorno" aria-hidden="true"></span>
    <h2 class="estado-vacio__titulo">{{ titulo() }}</h2>
    @if (texto(); as descripcion) {
      <p class="estado-vacio__texto">{{ descripcion }}</p>
    }
    <div class="acciones estado-vacio__acciones"><ng-content /></div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: var(--espacio-7) var(--espacio-4);
      border: 2px dashed var(--color-borde-control);
      border-radius: var(--radio-lg);
    }

    .estado-vacio__adorno {
      width: 18px;
      height: 32px;
      margin-bottom: var(--espacio-3);
      border-radius: 100% 0;
      background: var(--color-acento);
      transform: rotate(20deg);
    }

    .estado-vacio__titulo {
      font-size: var(--texto-lg);
    }

    .estado-vacio__texto {
      max-width: 48ch;
      color: var(--color-texto-suave);
    }

    .estado-vacio__acciones {
      justify-content: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstadoVacioComponent {
  readonly titulo = input.required<string>();
  readonly texto = input<string | null>(null);
}
