import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FeedbackEntrada, MotivoFeedback } from '../../../core/models';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { MOTIVOS_FEEDBACK, TEXTOS_FEEDBACK } from '../tutor.textos';

let contador = 0;

/** "Me sirvió" / "No me sirvió" (botones con texto) y motivo opcional. */
@Component({
  selector: 'app-feedback-mensaje',
  imports: [IconoComponent],
  template: `
    <div class="feedback" role="group" [attr.aria-labelledby]="idPregunta">
      <span class="feedback__pregunta" [id]="idPregunta">{{ textos.pregunta }}</span>
      <div class="feedback__botones">
        <button
          type="button"
          class="feedback__boton"
          [attr.aria-pressed]="util() === true"
          (click)="enviar.emit({ util: true })"
        >
          @if (util() === true) {
            <app-icono nombre="check" [tamano]="16" />
          }
          {{ textos.si }}
        </button>
        <button
          type="button"
          class="feedback__boton"
          [attr.aria-pressed]="util() === false"
          (click)="enviar.emit({ util: false })"
        >
          @if (util() === false) {
            <app-icono nombre="check" [tamano]="16" />
          }
          {{ textos.no }}
        </button>
      </div>
    </div>
    @if (util() === false && !motivoEnviado()) {
      <div class="feedback__motivo">
        <label [for]="idMotivo">{{ textos.motivo }}</label>
        <div class="feedback__fila">
          <select class="control" [id]="idMotivo" (change)="elegirMotivo($event)">
            <option value="">—</option>
            @for (m of motivos; track m.valor) {
              <option [value]="m.valor">{{ m.etiqueta }}</option>
            }
          </select>
          <button
            type="button"
            class="feedback__boton"
            [disabled]="!motivo()"
            (click)="enviarMotivo()"
          >
            {{ textos.enviarMotivo }}
          </button>
        </div>
      </div>
    }
    @if (motivoEnviado()) {
      <p class="feedback__gracias" role="status">{{ textos.gracias }}</p>
    }
  `,
  styleUrl: './feedback-mensaje.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackMensajeComponent {
  readonly util = input<boolean | null>(null);
  readonly enviar = output<FeedbackEntrada>();

  private readonly id = ++contador;
  protected readonly idPregunta = `feedback-${this.id}`;
  protected readonly idMotivo = `feedback-${this.id}-motivo`;
  protected readonly textos = TEXTOS_FEEDBACK;
  protected readonly motivos = MOTIVOS_FEEDBACK;
  protected readonly motivo = signal<MotivoFeedback | null>(null);
  protected readonly motivoEnviado = signal(false);

  protected elegirMotivo(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;
    this.motivo.set(MOTIVOS_FEEDBACK.find((m) => m.valor === valor)?.valor ?? null);
  }

  protected enviarMotivo(): void {
    const motivo = this.motivo();
    if (motivo) {
      this.enviar.emit({ util: false, motivo });
      this.motivoEnviado.set(true);
    }
  }
}
