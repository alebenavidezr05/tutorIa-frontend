import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EstadoVex, VexComponent } from '../vex/vex.component';

/** Patrón único para estados vacíos y errores suaves: Vex + mensaje corto + acción. */
@Component({
  selector: 'app-estado-vacio',
  imports: [VexComponent],
  template: `
    <app-vex class="estado-vacio__vex" [estado]="vex()" tamano="md" />
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
      padding: var(--espacio-6) var(--espacio-4);
      border: 1px solid var(--color-borde-suave);
      border-radius: var(--radio-xl);
      background: var(--color-superficie);
      box-shadow: var(--sombra-suave);
    }

    .estado-vacio__vex {
      margin-bottom: var(--espacio-3);
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
  readonly vex = input<EstadoVex>('acompanando');
}
