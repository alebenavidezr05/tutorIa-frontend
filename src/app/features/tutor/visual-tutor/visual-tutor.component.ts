import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VisualApiService } from '../../../core/api/visual-api.service';
import { Uuid, VisualPublico } from '../../../core/models';
import { TEXTOS_VISUAL } from '../tutor.textos';
import { DiagramaTutorComponent } from './diagrama-tutor.component';
import { ImagenTutorComponent } from './imagen-tutor.component';
import { esVisualPendiente, sondearVisual } from './sondeo-visual';

type VistaVisual = 'preparando' | 'imagen' | 'diagrama' | 'oculto';

function _vista(visual: VisualPublico | null): VistaVisual {
  if (esVisualPendiente(visual)) {
    return 'preparando';
  }
  if (visual?.estado !== 'LISTO') {
    return 'oculto';
  }
  if (visual.tipo === 'DIAGRAMA' && visual.diagrama) {
    return 'diagrama';
  }
  return visual.imagen ? 'imagen' : 'oculto';
}

/**
 * Recurso visual asíncrono de una respuesta. El texto nunca espera al visual: mientras esté
 * pendiente se muestra un marcador y se consulta con sondeo; `FALLIDO` se oculta sin error.
 */
@Component({
  selector: 'app-visual-tutor',
  imports: [ImagenTutorComponent, DiagramaTutorComponent],
  template: `
    @switch (vista()) {
      @case ('preparando') {
        <div class="visual__marcador" aria-busy="true" role="status">
          <span class="visual__pulso" aria-hidden="true"></span>
          {{ textos.preparando }}
        </div>
      }
      @case ('imagen') {
        @if (actual()?.imagen; as imagen) {
          <app-imagen-tutor
            [imagen]="imagen"
            [esIa]="esIa()"
            [avisoIa]="actual()?.aviso_ia ?? null"
          />
        }
      }
      @case ('diagrama') {
        @if (actual()?.diagrama; as diagrama) {
          <app-diagrama-tutor [diagrama]="diagrama" />
        }
      }
    }
  `,
  styles: `
    :host {
      display: block;
    }

    :host:has(.visual__marcador),
    :host:has(app-imagen-tutor),
    :host:has(app-diagrama-tutor) {
      margin-top: var(--espacio-3);
    }

    .visual__marcador {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--espacio-2);
      aspect-ratio: 16 / 9;
      max-height: 240px;
      border: 2px dashed var(--color-borde-control);
      border-radius: var(--radio-md);
      background: var(--color-fondo-alterno);
      color: var(--color-texto-suave);
      font-weight: 600;
    }

    .visual__pulso {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--color-acento);
      animation: pulso 1.2s ease-in-out infinite;
    }

    @keyframes pulso {
      50% {
        opacity: 0.3;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisualTutorComponent implements OnInit {
  readonly idMensaje = input.required<Uuid>();
  readonly visual = input<VisualPublico | null>(null);

  private readonly api = inject(VisualApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly textos = TEXTOS_VISUAL;
  protected readonly actual = signal<VisualPublico | null>(null);
  protected readonly vista = computed(() => _vista(this.actual()));
  protected readonly esIa = computed(
    () => this.actual()?.tipo === 'IA' || this.actual()?.generado_por_ia === true,
  );

  ngOnInit(): void {
    const inicial = this.visual();
    this.actual.set(inicial);
    if (!esVisualPendiente(inicial)) {
      return;
    }
    sondearVisual((id) => this.api.consultar(id), this.idMensaje())
      // Se detiene al salir de la pantalla.
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (visual) => this.actual.set(visual),
        error: () => this.ocultar(),
        // Si pasan 60 s sin terminar, se oculta con elegancia.
        complete: () => {
          if (esVisualPendiente(this.actual())) {
            this.ocultar();
          }
        },
      });
  }

  private ocultar(): void {
    const actual = this.actual();
    this.actual.set(actual ? { ...actual, estado: 'FALLIDO' } : null);
  }
}
