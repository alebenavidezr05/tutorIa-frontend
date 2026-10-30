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
import { RouterLink } from '@angular/router';
import { AutorizacionApiService } from '../../../core/api/autorizacion-api.service';
import { PrivacidadApiService } from '../../../core/api/privacidad-api.service';
import { ApiError, PoliticaPublica, comoApiError } from '../../../core/models';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { CampoFormularioComponent } from '../../../shared/ui/campo-formulario/campo-formulario.component';
import { ControlCampoDirective } from '../../../shared/ui/campo-formulario/control-campo.directive';
import { CasillaConsentimientoComponent } from '../../../shared/ui/casilla-consentimiento/casilla-consentimiento.component';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { TEXTO_ENLACE_EXTERNO } from '../../../shared/ui/textos-ui';
import { aplicarErroresServidor } from '../../../shared/utils/aplicar-errores-servidor';
import { conIndicador } from '../../../shared/utils/con-indicador';
import { enfocarPrimerError } from '../../../shared/utils/enfocar-error';
import {
  correoValidator,
  correosDistintosValidator,
  normalizarCorreo,
} from '../../../shared/validators';
import { textosFinalidad } from '../../privacidad/textos-finalidades';
import { TEXTOS_SOLICITAR } from '../autorizacion.textos';
import { PrellenadoAutorizacionService } from '../prellenado-autorizacion.service';

/** Pantalla pública del acudiente: sin sesión, sin cookies y sin el formulario del estudiante. */
@Component({
  selector: 'app-solicitar-autorizacion-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    BotonComponent,
    CampoFormularioComponent,
    ControlCampoDirective,
    CasillaConsentimientoComponent,
    IconoComponent,
    SpinnerComponent,
  ],
  templateUrl: './solicitar-autorizacion-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolicitarAutorizacionPageComponent implements OnInit {
  private readonly autorizacionApi = inject(AutorizacionApiService);
  private readonly privacidadApi = inject(PrivacidadApiService);
  private readonly prellenado = inject(PrellenadoAutorizacionService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly textos = TEXTOS_SOLICITAR;
  protected readonly textoExterno = TEXTO_ENLACE_EXTERNO;
  protected readonly politica = signal<PoliticaPublica | null>(null);
  protected readonly cargandoPolitica = signal(false);
  protected readonly errorPolitica = signal(false);
  protected readonly avisoPolitica = signal<string | null>(null);
  protected readonly enviando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly finalidades = computed(() => textosFinalidad(this.politica()));

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      correoAcudiente: ['', [Validators.required, correoValidator()]],
      correoEstudiante: ['', [Validators.required, correoValidator()]],
      declaraRepresentanteLegal: [false, [Validators.requiredTrue]],
      aceptaTratamiento: [false, [Validators.requiredTrue]],
      aceptaTransferenciaInternacional: [false, [Validators.requiredTrue]],
      permiteCompras: [false],
    },
    { validators: [correosDistintosValidator('correoAcudiente', 'correoEstudiante')] },
  );

  ngOnInit(): void {
    const correo = this.prellenado.tomar();
    if (correo) {
      this.form.controls.correoEstudiante.setValue(correo);
    }
    this.cargarPolitica();
  }

  protected cargarPolitica(): void {
    this.errorPolitica.set(false);
    this.privacidadApi
      .politica()
      .pipe(conIndicador(this.cargandoPolitica))
      .subscribe({
        next: (politica) => this.politica.set(politica),
        error: () => this.errorPolitica.set(true),
      });
  }

  protected enviar(): void {
    const politica = this.politica();
    if (this.form.invalid || !politica) {
      this.form.markAllAsTouched();
      enfocarPrimerError(this.host.nativeElement);
      return;
    }
    const v = this.form.getRawValue();
    this.autorizacionApi
      .solicitar({
        correo_acudiente: normalizarCorreo(v.correoAcudiente),
        correo_estudiante: normalizarCorreo(v.correoEstudiante),
        declara_representante_legal: v.declaraRepresentanteLegal,
        version_politica: politica.version,
        acepta_tratamiento: v.aceptaTratamiento,
        acepta_transferencia_internacional: v.aceptaTransferenciaInternacional,
        permite_compras: v.permiteCompras,
      })
      .pipe(conIndicador(this.enviando))
      .subscribe({
        next: () => this.enviado.set(true),
        error: (e: unknown) => this.manejarError(comoApiError(e)),
      });
  }

  protected nuevaSolicitud(): void {
    this.form.reset();
    this.enviado.set(false);
  }

  private manejarError(error: ApiError): void {
    if (error.codigo === 'POLITICA_DESACTUALIZADA') {
      this.form.patchValue({ aceptaTratamiento: false, aceptaTransferenciaInternacional: false });
      this.avisoPolitica.set(this.textos.politicaActualizada);
      this.cargarPolitica();
      return;
    }
    aplicarErroresServidor(this.form, error);
    enfocarPrimerError(this.host.nativeElement);
  }
}
