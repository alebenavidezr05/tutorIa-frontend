import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BloquePreguntaResumen } from '../../../core/models';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { TEXTOS_BLOQUES } from '../tutor.textos';

export interface ContextoResumen {
  readonly enunciado: string;
  readonly tituloVideo: string | null;
}

/** Pide al estudiante resumir el video con sus palabras; el resumen se envía como mensaje normal. */
@Component({
  selector: 'app-bloque-pregunta-resumen',
  imports: [BotonComponent],
  template: `
    <div class="resumen">
      <p class="resumen__titulo">{{ textos.resumenTitulo }}</p>
      <p>{{ bloque().enunciado }}</p>
      <button
        app-boton
        type="button"
        variante="secundario"
        [disabled]="deshabilitado()"
        (click)="responder.emit({ enunciado: bloque().enunciado, tituloVideo: tituloVideo() })"
      >
        {{ textos.responder }}
      </button>
    </div>
  `,
  styles: `
    .resumen {
      padding: var(--espacio-3) var(--espacio-4);
      border: 2px solid var(--color-acento);
      border-radius: var(--radio-md);
    }

    .resumen__titulo {
      margin-bottom: var(--espacio-1);
      font-weight: 800;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BloquePreguntaResumenComponent {
  readonly bloque = input.required<BloquePreguntaResumen>();
  readonly tituloVideo = input<string | null>(null);
  readonly deshabilitado = input(false);
  readonly responder = output<ContextoResumen>();

  protected readonly textos = TEXTOS_BLOQUES;
}
