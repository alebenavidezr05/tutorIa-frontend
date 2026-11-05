import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ArchivoApiService } from '../../../core/api/archivo-api.service';
import { ConversacionApiService } from '../../../core/api/conversacion-api.service';
import { CapacidadesService } from '../../../core/auth/capacidades.service';
import {
  FeedbackEntrada,
  ReporteEntrada,
  Uuid,
  comoApiError,
  tieneCodigo,
} from '../../../core/models';
import { AvisoErrorComponent } from '../../../shared/ui/aviso-error/aviso-error.component';
import { AvisoIaComponent } from '../../../shared/ui/aviso-ia/aviso-ia.component';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { EstadoVacioComponent } from '../../../shared/ui/estado-vacio/estado-vacio.component';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { InsigniaNivelComponent } from '../../../shared/ui/insignia-nivel/insignia-nivel.component';
import { ListaReferenciasComponent } from '../../../shared/ui/lista-referencias/lista-referencias.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { VexComponent } from '../../../shared/ui/vex/vex.component';
import { AvisoPagina, avisoDeError } from '../../../shared/utils/aviso-error';
import { conIndicador } from '../../../shared/utils/con-indicador';
import { referenciaApaAVista } from '../../../shared/utils/referencias';
import { ContextoResumen } from '../bloques/bloque-pregunta-resumen.component';
import { CampoMensajeComponent } from '../campo-mensaje/campo-mensaje.component';
import { ChatStore } from '../chat.store';
import { resumenParaAnunciar } from '../mensaje-chat';
import { MensajeTutorComponent } from '../mensaje-tutor/mensaje-tutor.component';
import { MensajeUsuarioComponent } from '../mensaje-usuario/mensaje-usuario.component';
import { ResumenesSesionService } from '../resumenes-sesion.service';
import { TEXTOS_BLOQUES, TEXTOS_CHAT, TUTOR } from '../tutor.textos';

const MENSAJE_LLM_CHAT = `Estamos teniendo problemas para generar la respuesta de ${TUTOR}. Inténtalo de nuevo en un momento.`;

@Component({
  selector: 'app-chat-page',
  imports: [
    RouterLink,
    AvisoErrorComponent,
    AvisoIaComponent,
    BotonComponent,
    CampoMensajeComponent,
    EstadoVacioComponent,
    IconoComponent,
    InsigniaNivelComponent,
    ListaReferenciasComponent,
    MensajeTutorComponent,
    MensajeUsuarioComponent,
    SpinnerComponent,
    VexComponent,
  ],
  providers: [ChatStore],
  templateUrl: './chat-page.component.html',
  styleUrl: './chat-page.component.scss',
  host: { '(window:pagehide)': 'alCerrarPestana()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatPageComponent implements OnDestroy {
  readonly idConversacion = input.required<string>();

  protected readonly store = inject(ChatStore);
  private readonly conversacionApi = inject(ConversacionApiService);
  private readonly archivoApi = inject(ArchivoApiService);
  private readonly capacidades = inject(CapacidadesService);
  private readonly resumenes = inject(ResumenesSesionService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly campo = viewChild(CampoMensajeComponent);
  private readonly fin = viewChild<ElementRef<HTMLElement>>('fin');

  protected readonly textos = TEXTOS_CHAT;
  protected readonly contexto = signal<string | null>(null);
  protected readonly abriendoNueva = signal(false);
  protected readonly avisoNueva = signal<AvisoPagina | null>(null);

  /** Lo que se anuncia por aria-live: "pensando", demora y respuesta recibida. */
  protected readonly anuncio = computed(() => {
    if (this.store.enviando()) {
      return this.store.demorado()
        ? `${this.textos.pensando} ${this.textos.demorado}`
        : this.textos.pensando;
    }
    const ultima = this.store.ultimaRespuesta();
    return ultima ? `${this.textos.respondio} ${resumenParaAnunciar(ultima)}` : '';
  });
  protected readonly aviso = computed(() => {
    const error = this.store.error();
    return error ? avisoDeError(error, MENSAJE_LLM_CHAT) : null;
  });
  protected readonly errorMensaje = computed(() => {
    const error = this.store.error();
    return error && tieneCodigo(error, 'MENSAJE_NO_PERMITIDO') ? error.mensaje : null;
  });
  protected readonly cerradaAlEnviar = computed(() => {
    const error = this.store.error();
    return error !== null && tieneCodigo(error, 'CONVERSACION_CERRADA');
  });
  /** Cualquier otro fallo: se ofrece reintentar conservando el texto y el archivo. */
  protected readonly errorReintentable = computed(
    () =>
      this.store.error() !== null &&
      !this.aviso() &&
      !this.errorMensaje() &&
      !this.cerradaAlEnviar(),
  );
  protected readonly referencias = computed(() =>
    this.store.referencias().map(referenciaApaAVista),
  );
  protected readonly urlsArchivo = computed(() => {
    const urls: Record<Uuid, string> = {};
    for (const m of this.store.mensajes()) {
      if (m.archivo) {
        urls[m.id] = this.archivoApi.urlContenido(m.archivo.id_archivo);
      }
    }
    return urls;
  });
  protected readonly sinCupoArchivos = computed(
    () => this.capacidades.limites()?.archivos_restantes_hoy === 0,
  );

  constructor() {
    // La misma pantalla puede abrir otra conversación: se cierra la anterior y se carga la nueva.
    effect(() => {
      const id = this.idConversacion();
      untracked(() => {
        this.store.cerrarAlSalir();
        this.store.reiniciar();
        this.contexto.set(null);
        this.store.cargar(id);
      });
    });
    // Al llegar mensajes nuevos se desplaza al final (el foco sigue en el campo).
    effect(() => {
      this.store.mensajes();
      untracked(() =>
        afterNextRender(() => this.fin()?.nativeElement.scrollIntoView({ block: 'end' }), {
          injector: this.injector,
        }),
      );
    });
  }

  ngOnDestroy(): void {
    this.store.cerrarAlSalir();
  }

  protected alCerrarPestana(): void {
    this.store.cerrarAlCerrarPestana();
  }

  protected enviar(): void {
    this.contexto.set(null);
    this.store.enviar();
  }

  protected feedback(idMensaje: Uuid, entrada: FeedbackEntrada): void {
    this.store.registrarFeedback(idMensaje, entrada);
  }

  protected reportar(idMensaje: Uuid, entrada: ReporteEntrada): void {
    this.store.reportar(idMensaje, entrada);
  }

  protected responderResumen(contexto: ContextoResumen): void {
    this.contexto.set(
      contexto.tituloVideo ? `${contexto.enunciado} (${contexto.tituloVideo})` : contexto.enunciado,
    );
    if (this.store.borrador().trim() === '') {
      this.store.borrador.set(TEXTOS_BLOQUES.prefijoResumen);
    }
    this.campo()?.enfocar();
  }

  protected terminar(): void {
    const id = this.idConversacion();
    this.store.cerrar().subscribe({
      next: (resumen) => {
        this.resumenes.guardar(id, resumen);
        void this.router.navigate(['/tutor', id, 'resumen']);
      },
      error: () => undefined,
    });
  }

  protected nuevaConversacion(): void {
    const tema = this.store.conversacion()?.tema;
    this.avisoNueva.set(null);
    this.conversacionApi
      .crear(tema ? { tema } : {})
      .pipe(conIndicador(this.abriendoNueva))
      .subscribe({
        next: (c) => void this.router.navigate(['/tutor', c.id_conversacion]),
        error: (e: unknown) => this.avisoNueva.set(avisoDeError(comoApiError(e))),
      });
  }
}
