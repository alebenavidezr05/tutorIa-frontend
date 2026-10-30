import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NivelCognitivo } from '../../../core/models';
import { NIVELES } from '../textos-ui';

/** Nivel con texto siempre visible (el color es solo refuerzo). */
@Component({
  selector: 'app-insignia-nivel',
  template: `
    <span class="insignia" [class]="'insignia--' + nivel().toLowerCase()">
      <span class="insignia__marcas" aria-hidden="true">
        <span></span><span></span><span></span>
      </span>
      Nivel {{ info().etiqueta }}
    </span>
    @if (conDescripcion()) {
      <p class="insignia__descripcion">{{ info().descripcion }}</p>
    }
  `,
  styles: `
    :host {
      display: inline-block;
    }

    .insignia {
      display: inline-flex;
      align-items: center;
      gap: var(--espacio-2);
      padding: var(--espacio-1) var(--espacio-3);
      border: 2px solid var(--color-texto);
      border-radius: var(--radio-pildora);
      background: var(--color-superficie);
      color: var(--color-texto);
      font-weight: 800;
      font-size: var(--texto-sm);
      white-space: nowrap;
    }

    .insignia--avanzado {
      background: var(--color-acento);
      border-color: var(--color-acento);
      color: var(--color-sobre-acento);
    }

    .insignia__marcas {
      display: inline-flex;
      gap: 2px;
      align-items: flex-end;

      span {
        width: 4px;
        border-radius: 2px;
        background: currentcolor;
        opacity: 0.25;
      }

      span:nth-child(1) {
        height: 6px;
        opacity: 1;
      }

      span:nth-child(2) {
        height: 10px;
      }

      span:nth-child(3) {
        height: 14px;
      }
    }

    .insignia--intermedio .insignia__marcas span:nth-child(2),
    .insignia--avanzado .insignia__marcas span {
      opacity: 1;
    }

    .insignia__descripcion {
      margin: var(--espacio-2) 0 0;
      color: var(--color-texto-suave);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InsigniaNivelComponent {
  readonly nivel = input.required<NivelCognitivo>();
  readonly conDescripcion = input(false);
  protected readonly info = computed(() => NIVELES[this.nivel()]);
}
