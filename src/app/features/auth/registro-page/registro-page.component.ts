import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { AuthApiService } from '../../../core/api/auth-api.service';
import { PrivacidadApiService } from '../../../core/api/privacidad-api.service';
import { siguientePaso } from '../../../core/auth/auth.guard';
import { SesionService } from '../../../core/auth/sesion.service';
import {
  ApiError,
  PoliticaPublica,
  TipoNivel,
  UsuarioPublico,
  comoApiError,
} from '../../../core/models';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { CampoFormularioComponent } from '../../../shared/ui/campo-formulario/campo-formulario.component';
import { ControlCampoDirective } from '../../../shared/ui/campo-formulario/control-campo.directive';
import { estadoControl } from '../../../shared/ui/campo-formulario/estado-control';
import { CasillaConsentimientoComponent } from '../../../shared/ui/casilla-consentimiento/casilla-consentimiento.component';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { TEXTO_ENLACE_EXTERNO } from '../../../shared/ui/textos-ui';
import {
  aplicarErroresServidor,
  marcarControles,
} from '../../../shared/utils/aplicar-errores-servidor';
import { calcularEdad } from '../../../shared/utils/calcular-edad';
import { conIndicador } from '../../../shared/utils/con-indicador';
import { enfocarPrimerError } from '../../../shared/utils/enfocar-error';
import {
  EDAD_MAYORIA,
  EDAD_MINIMA,
  NIVELES_POR_TIPO,
  contrasenaValidator,
  correoValidator,
  correosDistintosValidator,
  fechaNacimientoValidator,
  nivelEducativoValidator,
  nombreValidator,
} from '../../../shared/validators';
import { textosFinalidad } from '../../privacidad/textos-finalidades';
import { TEXTOS_REGISTRO } from '../auth.textos';
import { construirRegistro } from '../construir-registro';

/** Edad hasta la que se usa el texto más sencillo para menores. */
const EDAD_TEXTO_SENCILLO = 14;

function _hoyIso(hoy = new Date()): string {
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

@Component({
  selector: 'app-registro-page',
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
  templateUrl: './registro-page.component.html',
  styleUrl: './registro-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistroPageComponent implements OnInit {
  private readonly authApi = inject(AuthApiService);
  private readonly privacidadApi = inject(PrivacidadApiService);
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly textos = TEXTOS_REGISTRO;
  protected readonly textoExterno = TEXTO_ENLACE_EXTERNO;
  protected readonly hoy = _hoyIso();
  protected readonly cargando = signal(false);
  protected readonly cargandoPolitica = signal(false);
  protected readonly errorPolitica = signal(false);
  protected readonly avisoPolitica = signal<string | null>(null);
  protected readonly politica = signal<PoliticaPublica | null>(null);

  // Ninguna casilla viene premarcada (Ley 1581).
  // El correo del adulto solo se habilita (y se valida) mientras la fecha indique 13 a 17 años.
  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      nombre: ['', [Validators.required, nombreValidator()]],
      correo: ['', [Validators.required, correoValidator()]],
      contrasena: ['', [Validators.required, contrasenaValidator()]],
      fechaNacimiento: ['', [Validators.required, fechaNacimientoValidator()]],
      tipoNivel: ['' as TipoNivel | '', [Validators.required]],
      nivelEducativo: ['', [Validators.required, nivelEducativoValidator('tipoNivel')]],
      aceptaTratamiento: [false, [Validators.requiredTrue]],
      aceptaTransferenciaInternacional: [false, [Validators.requiredTrue]],
      aceptaPersonalizacion: [false],
      aceptaComunicaciones: [false],
      entiendeDatosMenor: [false],
      correoAcudiente: [{ value: '', disabled: true }, [Validators.required, correoValidator()]],
    },
    { validators: [correosDistintosValidator('correo', 'correoAcudiente')] },
  );

  private readonly valores = toSignal(
    this.form.valueChanges.pipe(map(() => this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );

  protected readonly estadoTipo = estadoControl(computed(() => this.form.controls.tipoNivel));
  protected readonly edad = computed(() => calcularEdad(this.valores().fechaNacimiento));
  protected readonly esMenor = computed(() => {
    const edad = this.edad();
    return edad !== null && edad >= EDAD_MINIMA && edad < EDAD_MAYORIA;
  });
  protected readonly textoMenor = computed(() =>
    (this.edad() ?? 0) <= EDAD_TEXTO_SENCILLO
      ? this.textos.menorTemprano
      : this.textos.menorAdolescente,
  );
  protected readonly opcionesNivel = computed(() => {
    const tipo = this.valores().tipoNivel;
    return tipo ? NIVELES_POR_TIPO[tipo] : [];
  });
  protected readonly finalidades = computed(() => textosFinalidad(this.politica()));
  protected readonly obligatoriasMarcadas = computed(
    () => this.valores().aceptaTratamiento && this.valores().aceptaTransferenciaInternacional,
  );
  protected readonly enviarDeshabilitado = computed(
    () => !this.obligatoriasMarcadas() || this.cargando() || this.politica() === null,
  );

  constructor() {
    // El selector de nivel cambia según el tipo: al cambiar el tipo se reinicia el nivel.
    this.form.controls.tipoNivel.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.form.controls.nivelEducativo.setValue(''));

    // El navegador solo muestra u oculta el campo: la edad real la decide el servidor.
    effect(() => {
      const menor = this.esMenor();
      untracked(() => {
        const control = this.form.controls.correoAcudiente;
        if (menor && control.disabled) {
          control.enable();
        } else if (!menor && control.enabled) {
          control.reset('');
          control.disable();
        }
      });
    });
  }

  ngOnInit(): void {
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
    const datos = construirRegistro(this.form.getRawValue(), politica.version, this.esMenor());
    this.authApi
      .registrar(datos)
      .pipe(conIndicador(this.cargando))
      .subscribe({
        next: (usuario) => this.entrar(usuario),
        error: (e: unknown) => this.manejarError(comoApiError(e)),
      });
  }

  private entrar(usuario: UsuarioPublico): void {
    this.sesion.establecer(usuario);
    // Recién creada, la cuenta va a confirmar el correo; los menores siguen luego a la autorización.
    void this.router.navigateByUrl(siguientePaso(usuario));
  }

  private manejarError(error: ApiError): void {
    const c = this.form.controls;
    switch (error.codigo) {
      case 'CORREO_YA_REGISTRADO':
        marcarControles([c.correo], error.mensaje);
        break;
      case 'EDAD_NO_PERMITIDA':
        marcarControles([c.fechaNacimiento], error.mensaje);
        break;
      case 'CORREO_ACUDIENTE_REQUERIDO':
      case 'CORREO_ACUDIENTE_INVALIDO':
        marcarControles([c.correoAcudiente], error.mensaje);
        break;
      case 'CONSENTIMIENTO_REQUERIDO':
        if (!aplicarErroresServidor(this.form, error)) {
          const faltantes = [c.aceptaTratamiento, c.aceptaTransferenciaInternacional];
          marcarControles(
            faltantes.filter((control) => !control.value),
            error.mensaje,
          );
        }
        break;
      case 'POLITICA_DESACTUALIZADA':
        this.reiniciarConsentimientos();
        this.avisoPolitica.set(this.textos.politicaActualizada);
        this.cargarPolitica();
        break;
      default:
        aplicarErroresServidor(this.form, error);
    }
    enfocarPrimerError(this.host.nativeElement);
  }

  private reiniciarConsentimientos(): void {
    this.form.patchValue({
      aceptaTratamiento: false,
      aceptaTransferenciaInternacional: false,
      aceptaPersonalizacion: false,
      aceptaComunicaciones: false,
      entiendeDatosMenor: false,
    });
  }
}
