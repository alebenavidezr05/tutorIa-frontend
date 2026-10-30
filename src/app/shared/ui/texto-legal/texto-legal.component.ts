import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { dividirEnSecciones } from '../../utils/secciones-texto';

/** Pinta un texto legal del backend como texto plano por secciones (sin innerHTML). */
@Component({
  selector: 'app-texto-legal',
  template: `
    @for (seccion of secciones(); track $index) {
      <section class="seccion">
        @if (seccion.titulo) {
          @if (seccion.nivel === 1) {
            <h2 class="seccion__titulo seccion__titulo--principal">{{ seccion.titulo }}</h2>
          } @else {
            <h3 class="seccion__titulo">{{ seccion.titulo }}</h3>
          }
        }
        @for (bloque of seccion.bloques; track $index) {
          @switch (bloque.tipo) {
            @case ('parrafo') {
              <p>{{ bloque.texto }}</p>
            }
            @case ('nota') {
              <p class="seccion__nota">{{ bloque.texto }}</p>
            }
            @case ('lista') {
              <ul>
                @for (item of bloque.items; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            }
          }
        }
      </section>
    }
  `,
  styles: `
    :host {
      display: block;
      max-width: var(--ancho-lectura);
    }

    .seccion {
      margin-bottom: var(--espacio-5);
    }

    .seccion__titulo {
      font-size: var(--texto-lg);
    }

    .seccion__titulo--principal {
      font-size: var(--texto-xl);
    }

    .seccion__nota {
      padding: var(--espacio-3);
      border-left: 4px solid var(--color-aviso);
      background: var(--color-aviso-fondo);
      color: var(--color-texto);
    }

    ul {
      padding-left: var(--espacio-5);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextoLegalComponent {
  readonly texto = input.required<string>();
  protected readonly secciones = computed(() => dividirEnSecciones(this.texto()));
}
