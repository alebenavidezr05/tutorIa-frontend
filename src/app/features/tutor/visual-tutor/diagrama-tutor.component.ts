import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Diagrama } from '../../../core/models';
import { TEXTOS_VISUAL } from '../tutor.textos';
import { ALTO_LINEA, RELLENO_NODO, calcularLayoutDiagrama } from './calcular-layout-diagrama';

let contador = 0;

/** Diagrama en SVG propio (sin librerías), con colores de marca y alternativa textual. */
@Component({
  selector: 'app-diagrama-tutor',
  template: `
    <figure class="diagrama">
      <div class="diagrama__lienzo" tabindex="0" [attr.aria-labelledby]="idTitulo">
        <svg
          role="img"
          [attr.viewBox]="viewBox()"
          [attr.aria-labelledby]="idTitulo"
          [attr.aria-describedby]="idDescripcion"
          preserveAspectRatio="xMidYMid meet"
        >
          <title [id]="idTitulo">{{ diagrama().titulo }}</title>
          <defs>
            <marker
              [id]="idFlecha"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M0 0 10 5 0 10Z" class="diagrama__punta" />
            </marker>
          </defs>
          @for (a of layout().aristas; track a.id) {
            <line
              class="diagrama__arista"
              [attr.x1]="a.x1"
              [attr.y1]="a.y1"
              [attr.x2]="a.x2"
              [attr.y2]="a.y2"
              [attr.marker-end]="marcador"
            />
            @if (a.etiqueta) {
              <text class="diagrama__etiqueta" [attr.x]="a.ex" [attr.y]="a.ey" text-anchor="middle">
                {{ a.etiqueta }}
              </text>
            }
          }
          @for (n of layout().nodos; track n.id) {
            <g [class.diagrama__nodo--principal]="n.principal" class="diagrama__nodo">
              <rect
                [attr.x]="n.x"
                [attr.y]="n.y"
                [attr.width]="n.ancho"
                [attr.height]="n.alto"
                rx="12"
              />
              <text [attr.x]="n.cx" [attr.y]="n.y + relleno" text-anchor="middle">
                @for (linea of n.lineas; track $index) {
                  <tspan [attr.x]="n.cx" [attr.dy]="altoLinea">{{ linea }}</tspan>
                }
              </text>
            </g>
          }
        </svg>
      </div>
      <figcaption>
        <details class="diagrama__texto">
          <summary>{{ textos.diagramaComoTexto }}</summary>
          <ul [id]="idDescripcion">
            @for (linea of layout().descripcion; track $index) {
              <li>{{ linea }}</li>
            }
          </ul>
        </details>
      </figcaption>
    </figure>
  `,
  styleUrl: './diagrama-tutor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagramaTutorComponent {
  readonly diagrama = input.required<Diagrama>();

  private readonly id = ++contador;
  protected readonly textos = TEXTOS_VISUAL;
  protected readonly idTitulo = `diagrama-${this.id}-titulo`;
  protected readonly idDescripcion = `diagrama-${this.id}-descripcion`;
  protected readonly idFlecha = `diagrama-${this.id}-flecha`;
  protected readonly marcador = `url(#${this.idFlecha})`;
  /** El primer `dy` desplaza la línea base dentro del relleno del nodo. */
  protected readonly altoLinea = ALTO_LINEA;
  protected readonly relleno = RELLENO_NODO - 4;

  protected readonly layout = computed(() => {
    const d = this.diagrama();
    return calcularLayoutDiagrama(d.nodos, d.aristas, d.tipo_diagrama, this.textos.sinConexiones);
  });
  protected readonly viewBox = computed(() => `0 0 ${this.layout().ancho} ${this.layout().alto}`);
}
