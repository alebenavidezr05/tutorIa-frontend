import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConversacionApiService } from '../../../core/api/conversacion-api.service';
import { ReferenciaPublica } from '../../../core/models';
import { NotificacionService } from '../../../core/notificaciones/notificacion.service';
import { AvisoIaComponent } from '../../../shared/ui/aviso-ia/aviso-ia.component';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { ListaReferenciasComponent } from '../../../shared/ui/lista-referencias/lista-referencias.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { TarjetaComponent } from '../../../shared/ui/tarjeta/tarjeta.component';
import { conIndicador } from '../../../shared/utils/con-indicador';
import { copiarAlPortapapeles } from '../../../shared/utils/portapapeles';
import { referenciaApaAVista, referenciasComoTexto } from '../../../shared/utils/referencias';
import { ResumenesSesionService } from '../resumenes-sesion.service';
import { TEXTOS_CHAT, TEXTOS_RESUMEN } from '../tutor.textos';

@Component({
  selector: 'app-resumen-sesion-page',
  imports: [
    RouterLink,
    AvisoIaComponent,
    BotonComponent,
    IconoComponent,
    ListaReferenciasComponent,
    SpinnerComponent,
    TarjetaComponent,
  ],
  templateUrl: './resumen-sesion-page.component.html',
  styles: `
    app-tarjeta,
    app-aviso-ia {
      display: block;
      max-width: 820px;
      margin-bottom: var(--espacio-5);
    }

    .resumen__texto {
      white-space: pre-line;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResumenSesionPageComponent implements OnInit {
  readonly idConversacion = input.required<string>();

  private readonly api = inject(ConversacionApiService);
  private readonly resumenes = inject(ResumenesSesionService);
  private readonly notificaciones = inject(NotificacionService);

  protected readonly textos = TEXTOS_RESUMEN;
  protected readonly avisoPorDefecto = TEXTOS_CHAT.avisoIa;
  protected readonly cargando = signal(false);
  protected readonly referenciasCargadas = signal<readonly ReferenciaPublica[] | null>(null);

  protected readonly resumen = computed(() => this.resumenes.de(this.idConversacion()));
  protected readonly referencias = computed(
    () => this.resumen()?.referencias ?? this.referenciasCargadas() ?? [],
  );
  protected readonly referenciasVista = computed(() => this.referencias().map(referenciaApaAVista));

  ngOnInit(): void {
    // Si se recarga la página, el resumen ya no está en memoria: se piden las referencias.
    if (!this.resumen()) {
      this.api
        .referencias(this.idConversacion())
        .pipe(conIndicador(this.cargando))
        .subscribe({
          next: (referencias) => this.referenciasCargadas.set(referencias),
          error: () => this.referenciasCargadas.set([]),
        });
    }
  }

  protected copiar(): void {
    void copiarAlPortapapeles(referenciasComoTexto(this.referencias())).then((copiado) =>
      copiado
        ? this.notificaciones.exito(this.textos.copiadas)
        : this.notificaciones.error(this.textos.noCopiadas),
    );
  }
}
