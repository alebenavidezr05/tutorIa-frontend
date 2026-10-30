import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { PrivacidadApiService } from '../../../core/api/privacidad-api.service';
import { RUTA_INICIO } from '../../../core/auth/auth.guard';
import { PoliticaPublica, comoApiError, tieneCodigo } from '../../../core/models';
import { NotificacionService } from '../../../core/notificaciones/notificacion.service';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { CasillaConsentimientoComponent } from '../../../shared/ui/casilla-consentimiento/casilla-consentimiento.component';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { TextoLegalComponent } from '../../../shared/ui/texto-legal/texto-legal.component';
import { aplicarErroresServidor } from '../../../shared/utils/aplicar-errores-servidor';
import { conIndicador } from '../../../shared/utils/con-indicador';
import { enfocarPrimerError } from '../../../shared/utils/enfocar-error';
import { rutaInternaSegura } from '../../../shared/utils/ruta-segura';
import { TEXTOS_ACEPTAR_POLITICA } from '../privacidad.textos';
import { textosFinalidad } from '../textos-finalidades';

/** Se llega aquí cuando el backend responde POLITICA_DESACTUALIZADA. */
@Component({
  selector: 'app-aceptar-politica-page',
  imports: [
    ReactiveFormsModule,
    BotonComponent,
    CasillaConsentimientoComponent,
    IconoComponent,
    SpinnerComponent,
    TextoLegalComponent,
  ],
  templateUrl: './aceptar-politica-page.component.html',
  styles: `
    .texto {
      max-height: 50dvh;
      overflow-y: auto;
      margin-bottom: var(--espacio-5);
      padding: var(--espacio-4);
      border: 1px solid var(--color-borde-control);
      border-radius: var(--radio-md);
      background: var(--color-superficie);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AceptarPoliticaPageComponent implements OnInit {
  /** Ruta a la que volver (query param `?volver=`). */
  readonly volver = input<string>();

  private readonly api = inject(PrivacidadApiService);
  private readonly router = inject(Router);
  private readonly notificaciones = inject(NotificacionService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly textos = TEXTOS_ACEPTAR_POLITICA;
  protected readonly politica = signal<PoliticaPublica | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal(false);
  protected readonly enviando = signal(false);
  protected readonly finalidades = computed(() => textosFinalidad(this.politica()));

  protected readonly form = inject(NonNullableFormBuilder).group({
    aceptaTratamiento: [false, [Validators.requiredTrue]],
    aceptaTransferenciaInternacional: [false, [Validators.requiredTrue]],
  });
  private readonly valores = toSignal(
    this.form.valueChanges.pipe(map(() => this.form.getRawValue())),
    {
      initialValue: this.form.getRawValue(),
    },
  );
  protected readonly deshabilitado = computed(
    () =>
      this.enviando() ||
      !this.politica() ||
      !this.valores().aceptaTratamiento ||
      !this.valores().aceptaTransferenciaInternacional,
  );

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.error.set(false);
    this.form.reset();
    this.api
      .politica()
      .pipe(conIndicador(this.cargando))
      .subscribe({
        next: (politica) => this.politica.set(politica),
        error: () => this.error.set(true),
      });
  }

  protected aceptar(): void {
    const politica = this.politica();
    if (this.form.invalid || !politica) {
      this.form.markAllAsTouched();
      enfocarPrimerError(this.host.nativeElement);
      return;
    }
    const v = this.form.getRawValue();
    this.api
      .aceptarPolitica({
        version_politica: politica.version,
        acepta_tratamiento: v.aceptaTratamiento,
        acepta_transferencia_internacional: v.aceptaTransferenciaInternacional,
      })
      .pipe(conIndicador(this.enviando))
      .subscribe({
        next: () => {
          this.notificaciones.exito(this.textos.aceptada);
          void this.router.navigateByUrl(rutaInternaSegura(this.volver(), RUTA_INICIO));
        },
        error: (e: unknown) => {
          const error = comoApiError(e);
          if (tieneCodigo(error, 'POLITICA_DESACTUALIZADA')) {
            this.cargar();
          } else {
            aplicarErroresServidor(this.form, error);
            enfocarPrimerError(this.host.nativeElement);
          }
        },
      });
  }
}
