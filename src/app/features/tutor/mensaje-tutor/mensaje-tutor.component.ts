import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { BloqueTutor, FeedbackEntrada, FuentePublica, ReporteEntrada } from '../../../core/models';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { VexComponent } from '../../../shared/ui/vex/vex.component';
import { BloqueAnalogiaComponent } from '../bloques/bloque-analogia.component';
import { BloqueEjemploComponent } from '../bloques/bloque-ejemplo.component';
import { BloqueFormulaComponent } from '../bloques/bloque-formula.component';
import { BloquePasosComponent } from '../bloques/bloque-pasos.component';
import { BloquePreguntaComprensionComponent } from '../bloques/bloque-pregunta-comprension.component';
import {
  BloquePreguntaResumenComponent,
  ContextoResumen,
} from '../bloques/bloque-pregunta-resumen.component';
import { BloqueTextoComponent } from '../bloques/bloque-texto.component';
import { BloqueVideoComponent } from '../bloques/bloque-video.component';
import { FeedbackMensajeComponent } from '../feedback-mensaje/feedback-mensaje.component';
import { MensajeChat, bloquesConocidos } from '../mensaje-chat';
import { ReportarMensajeComponent } from '../reportar-mensaje/reportar-mensaje.component';
import { TEXTOS_CHAT, TEXTOS_FEEDBACK, TUTOR } from '../tutor.textos';
import { VisualTutorComponent } from '../visual-tutor/visual-tutor.component';

export interface VistaBloque {
  readonly clave: number;
  readonly bloque: BloqueTutor;
  readonly fuentes: readonly FuentePublica[];
  readonly tituloVideo: string | null;
}

let contador = 0;

/**
 * Respuesta del tutor. Pinta `bloques` con @switch sobre `tipo` (un tipo desconocido se ignora) y
 * el recurso visual aparte. Si no es académica, se muestra como aviso del sistema.
 */
@Component({
  selector: 'app-mensaje-tutor',
  imports: [
    IconoComponent,
    BloqueTextoComponent,
    BloquePasosComponent,
    BloqueEjemploComponent,
    BloqueAnalogiaComponent,
    BloqueFormulaComponent,
    BloquePreguntaComprensionComponent,
    BloqueVideoComponent,
    BloquePreguntaResumenComponent,
    FeedbackMensajeComponent,
    ReportarMensajeComponent,
    VisualTutorComponent,
    VexComponent,
  ],
  templateUrl: './mensaje-tutor.component.html',
  styleUrl: './mensaje-tutor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MensajeTutorComponent {
  readonly mensaje = input.required<MensajeChat>();
  readonly reportado = input(false);
  readonly deshabilitarResumen = input(false);
  readonly feedback = output<FeedbackEntrada>();
  readonly reportar = output<ReporteEntrada>();
  readonly responderResumen = output<ContextoResumen>();

  protected readonly tutor = TUTOR;
  protected readonly textos = TEXTOS_CHAT;
  protected readonly textosFeedback = TEXTOS_FEEDBACK;
  protected readonly idAcciones = `acciones-mensaje-${++contador}`;
  protected readonly accionesAbiertas = signal(false);

  protected readonly esAviso = computed(() => this.mensaje().ambito !== 'ACADEMICO');
  protected readonly bloques = computed<readonly VistaBloque[]>(() => {
    const mensaje = this.mensaje();
    const fuentesPorId = new Map(mensaje.fuentes.map((f) => [f.id_fuente, f]));
    const bloques = bloquesConocidos(mensaje.bloques);
    const titulosVideo = new Map(
      bloques.flatMap((b) => (b.tipo === 'video' ? [[b.id_video, b.titulo] as const] : [])),
    );
    return bloques.map((bloque, clave) => ({
      clave,
      bloque,
      fuentes:
        'fuentes' in bloque && bloque.fuentes
          ? bloque.fuentes.flatMap((id) => fuentesPorId.get(id) ?? [])
          : [],
      tituloVideo:
        bloque.tipo === 'pregunta_resumen' ? (titulosVideo.get(bloque.id_video) ?? null) : null,
    }));
  });
  protected readonly mostrarVisual = computed(() => {
    const visual = this.mensaje().visual;
    return visual !== null && visual.estado !== 'NO_NECESARIO';
  });

  protected alternarAcciones(): void {
    this.accionesAbiertas.update((abiertas) => !abiertas);
  }
}
