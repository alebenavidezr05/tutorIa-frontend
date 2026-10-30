import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconoComponent } from '../icono/icono.component';

/** Aviso de transparencia fijo: el tutor es una IA. No se puede ocultar. */
@Component({
  selector: 'app-aviso-ia',
  imports: [IconoComponent],
  template: `
    <app-icono nombre="ia" />
    <p><strong>Inteligencia artificial.</strong> {{ texto() }}</p>
  `,
  styles: `
    :host {
      display: flex;
      align-items: flex-start;
      gap: var(--espacio-2);
      padding: var(--espacio-2) var(--espacio-3);
      border-left: 4px solid var(--color-acento);
      border-radius: var(--radio-sm);
      background: var(--color-superficie);
      color: var(--color-texto);
      font-size: var(--texto-sm);
    }

    p {
      margin: 0;
    }
  `,
  host: { role: 'note' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvisoIaComponent {
  readonly texto = input.required<string>();
}
