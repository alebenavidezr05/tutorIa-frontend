import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ConsentimientoPublico, Finalidad } from '../../../core/models';
import { InterruptorComponent } from '../../../shared/ui/interruptor/interruptor.component';
import { NOMBRE_FINALIDAD } from '../textos-finalidades';
import { NOMBRE_OTORGADO_POR, TEXTOS_PRIVACIDAD } from '../privacidad.textos';

export interface CambioConsentimiento {
  finalidad: Finalidad;
  otorgado: boolean;
}

/** Finalidades que el titular puede activar o desactivar desde la interfaz. */
export const FINALIDADES_EDITABLES: ReadonlySet<Finalidad> = new Set<Finalidad>([
  'PERSONALIZACION',
  'COMUNICACIONES',
]);

@Component({
  selector: 'app-seccion-autorizaciones',
  imports: [DatePipe, InterruptorComponent],
  template: `
    <h2 id="privacidad-autorizaciones">{{ textos.titulo }}</h2>
    @if (consentimientos().length === 0) {
      <p class="texto-suave">{{ textos.vacio }}</p>
    }
    <ul class="lista-limpia filas">
      @for (c of consentimientos(); track c.finalidad) {
        <li class="fila">
          @if (editables.has(c.finalidad)) {
            <app-interruptor
              [activo]="c.otorgado"
              [etiqueta]="nombres[c.finalidad]"
              [deshabilitado]="procesando() === c.finalidad"
              (cambiar)="cambiar.emit({ finalidad: c.finalidad, otorgado: $event })"
            />
          } @else {
            <p class="fila__nombre">{{ nombres[c.finalidad] }}</p>
            <p class="fila__estado">{{ c.otorgado ? textos.otorgada : textos.noOtorgada }}</p>
          }
          <p class="fila__meta">
            {{ textos.fecha }}: {{ c.fecha | date: 'mediumDate' }} · {{ textos.version }}:
            {{ c.version_politica }} · {{ textos.por }}: {{ otorgadoPor[c.otorgado_por] }}
          </p>
          @if (c.finalidad === 'TRATAMIENTO') {
            <p class="fila__nota">{{ textos.tratamientoNota }}</p>
          }
        </li>
      }
    </ul>
  `,
  styles: `
    .fila {
      padding-block: var(--espacio-3);
      border-bottom: 1px solid var(--color-borde);
    }

    .fila p {
      margin: 0;
    }

    .fila__nombre,
    .fila__estado {
      font-weight: 700;
    }

    .fila .fila__meta,
    .fila .fila__nota {
      margin-top: var(--espacio-1);
      font-size: var(--texto-sm);
      color: var(--color-texto-suave);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeccionAutorizacionesComponent {
  readonly consentimientos = input.required<readonly ConsentimientoPublico[]>();
  /** Finalidad que se está guardando. */
  readonly procesando = input<Finalidad | null>(null);
  readonly cambiar = output<CambioConsentimiento>();

  protected readonly textos = TEXTOS_PRIVACIDAD.autorizaciones;
  protected readonly nombres = NOMBRE_FINALIDAD;
  protected readonly otorgadoPor = NOMBRE_OTORGADO_POR;
  protected readonly editables = FINALIDADES_EDITABLES;
}
