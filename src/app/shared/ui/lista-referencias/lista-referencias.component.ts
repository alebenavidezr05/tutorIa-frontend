import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReferenciaVista } from '../../utils/referencias';
import { IconoComponent } from '../icono/icono.component';
import { TEXTO_ENLACE_EXTERNO } from '../textos-ui';

/** Lista de fuentes o referencias APA 7. Si no hay referencias no se inventa ninguna. */
@Component({
  selector: 'app-lista-referencias',
  imports: [IconoComponent],
  template: `
    @if (titulo(); as encabezado) {
      <h2 class="referencias__titulo" [id]="idTitulo()">{{ encabezado }}</h2>
    }
    @if (referencias().length > 0) {
      <ol class="referencias" [attr.aria-labelledby]="titulo() ? idTitulo() : null">
        @for (ref of referencias(); track ref.id) {
          <li class="referencia" [class.referencia--apa]="formato() === 'apa'">
            <p class="referencia__texto">{{ ref.texto }}</p>
            @if (ref.rotulo || ref.detalle) {
              <p class="referencia__meta">
                @if (ref.rotulo) {
                  <span class="referencia__rotulo">{{ ref.rotulo }}</span>
                }
                @if (ref.detalle) {
                  <span>{{ ref.detalle }}</span>
                }
              </p>
            }
            <p class="referencia__enlaces">
              @if (ref.url) {
                <a [href]="ref.url" target="_blank" rel="noopener noreferrer" class="enlace-boton">
                  Abrir fuente <app-icono nombre="externo" [tamano]="16" />
                  <span class="visualmente-oculto">{{ textoExterno }}</span>
                </a>
              }
              @if (ref.doi) {
                <a [href]="ref.doi" target="_blank" rel="noopener noreferrer" class="enlace-boton">
                  DOI <app-icono nombre="externo" [tamano]="16" />
                  <span class="visualmente-oculto">{{ textoExterno }}</span>
                </a>
              }
            </p>
          </li>
        }
      </ol>
    } @else {
      <p class="texto-suave">{{ textoVacio() }}</p>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    .referencias__titulo {
      font-size: var(--texto-lg);
    }

    .referencias {
      margin: 0;
      padding-left: var(--espacio-5);
    }

    .referencia {
      margin-bottom: var(--espacio-4);
    }

    .referencia--apa .referencia__texto {
      padding-left: var(--espacio-5);
      text-indent: calc(-1 * var(--espacio-5));
    }

    .referencia__texto {
      margin: 0;
      font-weight: 600;
    }

    .referencia--apa .referencia__texto {
      font-weight: 400;
    }

    .referencia__meta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--espacio-2);
      align-items: center;
      margin: var(--espacio-1) 0 0;
      font-size: var(--texto-sm);
      color: var(--color-texto-suave);
    }

    .referencia__rotulo {
      padding: 0 var(--espacio-2);
      border: 1px solid var(--color-borde-control);
      border-radius: var(--radio-pildora);
      font-weight: 700;
      color: var(--color-texto);
    }

    .referencia__enlaces {
      display: flex;
      flex-wrap: wrap;
      gap: 0 var(--espacio-3);
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaReferenciasComponent {
  readonly referencias = input.required<readonly ReferenciaVista[]>();
  readonly titulo = input<string | null>(null);
  readonly formato = input<'fuentes' | 'apa'>('fuentes');
  readonly textoVacio = input('Esta respuesta no cita fuentes.');
  readonly idTitulo = input('referencias-titulo');

  protected readonly textoExterno = TEXTO_ENLACE_EXTERNO;
}
