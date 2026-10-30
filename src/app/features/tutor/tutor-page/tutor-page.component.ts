import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ConversacionApiService } from '../../../core/api/conversacion-api.service';
import { ApiError, ConversacionPublica, comoApiError, tieneCodigo } from '../../../core/models';
import { NotificacionService } from '../../../core/notificaciones/notificacion.service';
import { AvisoErrorComponent } from '../../../shared/ui/aviso-error/aviso-error.component';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { CampoFormularioComponent } from '../../../shared/ui/campo-formulario/campo-formulario.component';
import { ControlCampoDirective } from '../../../shared/ui/campo-formulario/control-campo.directive';
import { DialogoConfirmacionComponent } from '../../../shared/ui/dialogo-confirmacion/dialogo-confirmacion.component';
import { EstadoVacioComponent } from '../../../shared/ui/estado-vacio/estado-vacio.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { TarjetaComponent } from '../../../shared/ui/tarjeta/tarjeta.component';
import {
  aplicarErroresServidor,
  marcarControles,
} from '../../../shared/utils/aplicar-errores-servidor';
import { AvisoPagina, avisoDeError } from '../../../shared/utils/aviso-error';
import { conIndicador } from '../../../shared/utils/con-indicador';
import { enfocarPrimerError } from '../../../shared/utils/enfocar-error';
import { LONGITUD_MAX_TEMA, normalizarTexto, temaValidator } from '../../../shared/validators';
import { ESTADO_CONVERSACION, TEXTOS_TUTOR } from '../tutor.textos';

const TAMANO_PAGINA = 20;

@Component({
  selector: 'app-tutor-page',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    AvisoErrorComponent,
    BotonComponent,
    CampoFormularioComponent,
    ControlCampoDirective,
    DialogoConfirmacionComponent,
    EstadoVacioComponent,
    SpinnerComponent,
    TarjetaComponent,
  ],
  templateUrl: './tutor-page.component.html',
  styleUrl: './tutor-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TutorPageComponent implements OnInit {
  private readonly api = inject(ConversacionApiService);
  private readonly router = inject(Router);
  private readonly notificaciones = inject(NotificacionService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly textos = TEXTOS_TUTOR;
  protected readonly estados = ESTADO_CONVERSACION;
  protected readonly maximo = LONGITUD_MAX_TEMA;
  protected readonly conversaciones = signal<readonly ConversacionPublica[]>([]);
  protected readonly total = signal(0);
  protected readonly pagina = signal(1);
  protected readonly cargando = signal(false);
  protected readonly error = signal(false);
  protected readonly creando = signal(false);
  protected readonly borrando = signal(false);
  protected readonly aBorrar = signal<ConversacionPublica | null>(null);
  protected readonly aviso = signal<AvisoPagina | null>(null);
  protected readonly hayMas = computed(() => this.conversaciones().length < this.total());

  protected readonly form = inject(NonNullableFormBuilder).group({
    tema: ['', [Validators.required, temaValidator()]],
  });

  ngOnInit(): void {
    this.cargar(1);
  }

  protected cargar(pagina: number): void {
    this.error.set(false);
    this.api
      .listar(pagina, TAMANO_PAGINA)
      .pipe(conIndicador(this.cargando))
      .subscribe({
        next: (datos) => {
          this.pagina.set(datos.pagina);
          this.total.set(datos.total);
          this.conversaciones.update((lista) =>
            pagina === 1 ? datos.items : [...lista, ...datos.items],
          );
        },
        error: () => this.error.set(true),
      });
  }

  protected cargarMas(): void {
    this.cargar(this.pagina() + 1);
  }

  protected crear(): void {
    this.aviso.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      enfocarPrimerError(this.host.nativeElement);
      return;
    }
    this.api
      .crear({ tema: normalizarTexto(this.form.getRawValue().tema) })
      .pipe(conIndicador(this.creando))
      .subscribe({
        next: (c) => void this.router.navigate(['/tutor', c.id_conversacion]),
        error: (e: unknown) => this.manejarError(comoApiError(e)),
      });
  }

  protected pedirBorrar(conversacion: ConversacionPublica): void {
    this.aBorrar.set(conversacion);
  }

  protected cancelarBorrar(): void {
    this.aBorrar.set(null);
  }

  protected borrar(): void {
    const conversacion = this.aBorrar();
    if (!conversacion) {
      return;
    }
    this.api
      .eliminar(conversacion.id_conversacion)
      .pipe(conIndicador(this.borrando))
      .subscribe({
        next: () => {
          this.aBorrar.set(null);
          this.conversaciones.update((lista) =>
            lista.filter((c) => c.id_conversacion !== conversacion.id_conversacion),
          );
          this.total.update((t) => Math.max(0, t - 1));
          this.notificaciones.exito(this.textos.borrada);
        },
        error: () => this.aBorrar.set(null),
      });
  }

  private manejarError(error: ApiError): void {
    if (tieneCodigo(error, 'TEMA_NO_PERMITIDO', 'TEMA_SIN_FUENTES', 'MENSAJE_NO_PERMITIDO')) {
      marcarControles([this.form.controls.tema], error.mensaje);
      enfocarPrimerError(this.host.nativeElement);
    } else if (!aplicarErroresServidor(this.form, error)) {
      this.aviso.set(avisoDeError(error));
    }
  }
}
