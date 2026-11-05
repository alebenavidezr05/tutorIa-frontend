import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DiagnosticoApiService } from '../../../core/api/diagnostico-api.service';
import { SesionService } from '../../../core/auth/sesion.service';
import { ApiError, NivelCognitivo, comoApiError, tieneCodigo } from '../../../core/models';
import { AvisoErrorComponent } from '../../../shared/ui/aviso-error/aviso-error.component';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { CampoFormularioComponent } from '../../../shared/ui/campo-formulario/campo-formulario.component';
import { ControlCampoDirective } from '../../../shared/ui/campo-formulario/control-campo.directive';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { InsigniaNivelComponent } from '../../../shared/ui/insignia-nivel/insignia-nivel.component';
import { TarjetaComponent } from '../../../shared/ui/tarjeta/tarjeta.component';
import { VexComponent } from '../../../shared/ui/vex/vex.component';
import {
  aplicarErroresServidor,
  marcarControles,
} from '../../../shared/utils/aplicar-errores-servidor';
import { AvisoPagina, avisoDeError } from '../../../shared/utils/aviso-error';
import { conIndicador } from '../../../shared/utils/con-indicador';
import { enfocarPrimerError } from '../../../shared/utils/enfocar-error';
import { LONGITUD_MAX_TEMA, normalizarTexto, temaValidator } from '../../../shared/validators';
import { TEXTOS_COMO_FUNCIONA, TEXTOS_TEMA } from '../diagnostico.textos';
import { FlujoDiagnosticoService } from '../flujo-diagnostico.service';

@Component({
  selector: 'app-tema-page',
  imports: [
    ReactiveFormsModule,
    AvisoErrorComponent,
    BotonComponent,
    CampoFormularioComponent,
    ControlCampoDirective,
    IconoComponent,
    InsigniaNivelComponent,
    TarjetaComponent,
    VexComponent,
  ],
  templateUrl: './tema-page.component.html',
  styleUrl: './tema-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemaPageComponent {
  private readonly api = inject(DiagnosticoApiService);
  private readonly flujo = inject(FlujoDiagnosticoService);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly sesion = inject(SesionService);

  protected readonly textos = TEXTOS_TEMA;
  protected readonly como = TEXTOS_COMO_FUNCIONA;
  protected readonly niveles: readonly NivelCognitivo[] = ['BASICO', 'INTERMEDIO', 'AVANZADO'];
  /** Solo en móvil: el bloque «¿Cómo funciona?» empieza plegado. */
  protected readonly comoAbierto = signal(false);
  /** Saludo con el primer nombre del usuario (solo presentación). */
  protected readonly saludo = computed(() =>
    this.textos.saludo(this.sesion.usuario()?.nombre.trim().split(/\s+/)[0] ?? ''),
  );
  protected readonly maximo = LONGITUD_MAX_TEMA;
  protected readonly cargando = signal(false);
  protected readonly aviso = signal<AvisoPagina | null>(null);
  protected readonly form = inject(NonNullableFormBuilder).group({
    tema: ['', [Validators.required, temaValidator()]],
  });

  protected usarEjemplo(ejemplo: string): void {
    this.form.controls.tema.setValue(ejemplo);
    this.form.controls.tema.markAsTouched();
  }

  protected enviar(): void {
    this.aviso.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      enfocarPrimerError(this.host.nativeElement);
      return;
    }
    this.api
      .crear(normalizarTexto(this.form.getRawValue().tema))
      .pipe(conIndicador(this.cargando))
      .subscribe({
        next: (cuestionario) => {
          this.flujo.iniciar(cuestionario);
          void this.router.navigate(['/diagnostico', cuestionario.id_sesion]);
        },
        error: (e: unknown) => this.manejarError(comoApiError(e)),
      });
  }

  private manejarError(error: ApiError): void {
    if (tieneCodigo(error, 'TEMA_NO_PERMITIDO', 'TEMA_SIN_FUENTES')) {
      marcarControles([this.form.controls.tema], error.mensaje);
      enfocarPrimerError(this.host.nativeElement);
      return;
    }
    if (!aplicarErroresServidor(this.form, error)) {
      this.aviso.set(avisoDeError(error));
    }
  }
}
