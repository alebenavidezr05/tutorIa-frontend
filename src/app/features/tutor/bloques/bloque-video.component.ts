import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { BloqueVideo } from '../../../core/models';
import { DuracionPipe } from '../../../shared/pipes/duracion.pipe';
import {
  YoutubeEmbedUrlPipe,
  esYoutubeIdValido,
} from '../../../shared/pipes/youtube-embed-url.pipe';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { TEXTO_ENLACE_EXTERNO } from '../../../shared/ui/textos-ui';
import { urlExternaSegura } from '../../../shared/utils/referencias';
import { TEXTOS_BLOQUES } from '../tutor.textos';

/**
 * Video explicativo. Por privacidad, primero se muestra una tarjeta-botón SIN imagen de YouTube:
 * no se carga ningún recurso de terceros hasta que el estudiante pulsa "Ver video". El iframe usa
 * youtube-nocookie.com, sin reproducción automática.
 */
@Component({
  selector: 'app-bloque-video',
  imports: [DuracionPipe, YoutubeEmbedUrlPipe, IconoComponent],
  templateUrl: './bloque-video.component.html',
  styleUrl: './bloque-video.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BloqueVideoComponent {
  readonly bloque = input.required<BloqueVideo>();

  protected readonly textos = TEXTOS_BLOQUES.video;
  protected readonly textoExterno = TEXTO_ENLACE_EXTERNO;
  protected readonly reproduciendo = signal(false);
  /** Con un id inválido no se ofrece el reproductor: solo queda el enlace. */
  protected readonly idValido = computed(() => esYoutubeIdValido(this.bloque().youtube_id));
  protected readonly urlYoutube = computed(() => urlExternaSegura(this.bloque().url));

  private readonly injector = inject(Injector);
  private readonly iframe = viewChild<ElementRef<HTMLIFrameElement>>('reproductor');

  /** El iframe se crea solo tras el clic; el foco pasa al reproductor. */
  protected reproducir(): void {
    this.reproduciendo.set(true);
    afterNextRender(() => this.iframe()?.nativeElement.focus(), { injector: this.injector });
  }
}
