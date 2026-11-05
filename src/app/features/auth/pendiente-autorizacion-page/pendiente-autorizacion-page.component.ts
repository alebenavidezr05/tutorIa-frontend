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
import { Router } from '@angular/router';
import { AutorizacionApiService } from '../../../core/api/autorizacion-api.service';
import { RUTA_PENDIENTE, destinoPostRegistro, siguientePaso } from '../../../core/auth/auth.guard';
import { SesionService } from '../../../core/auth/sesion.service';
import { ApiError, MiAutorizacion, comoApiError, tieneCodigo } from '../../../core/models';
import { NotificacionService } from '../../../core/notificaciones/notificacion.service';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { CampoFormularioComponent } from '../../../shared/ui/campo-formulario/campo-formulario.component';
import { ControlCampoDirective } from '../../../shared/ui/campo-formulario/control-campo.directive';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import {
  aplicarErroresServidor,
  marcarControles,
} from '../../../shared/utils/aplicar-errores-servidor';
import { conIndicador } from '../../../shared/utils/con-indicador';
import { crearCuentaRegresiva, formatearCuenta } from '../../../shared/utils/cuenta-regresiva';
import { enfocarPrimerError } from '../../../shared/utils/enfocar-error';
import {
  correoValidator,
  correosDistintosValidator,
  normalizarCorreo,
} from '../../../shared/validators';
import { TEXTOS_PENDIENTE } from '../auth.textos';

/** Espera por defecto si un 429 no trae `Retry-After`. */
const ESPERA_POR_DEFECTO = 60;

export { formatearCuenta };

/**
 * El estudiante menor espera la autorización de su adulto responsable. La pantalla solo refleja
 * lo que responde `GET /autorizaciones/mia`: quién puede qué lo decide el backend.
 */
@Component({
  selector: 'app-pendiente-autorizacion-page',
  imports: [
    ReactiveFormsModule,
    BotonComponent,
    CampoFormularioComponent,
    ControlCampoDirective,
    IconoComponent,
    SpinnerComponent,
  ],
  templateUrl: './pendiente-autorizacion-page.component.html',
  styles: `
    .estado {
      margin-block: var(--espacio-4);
    }

    .otro-correo {
      margin-block: var(--espacio-4);
      padding: var(--espacio-4);
      border: 1px solid var(--color-borde-suave);
      border-radius: var(--radio-lg);
      background: var(--color-fondo);
    }

    .acciones {
      margin-block: var(--espacio-4);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PendienteAutorizacionPageComponent implements OnInit {
  private readonly api = inject(AutorizacionApiService);
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);
  private readonly notificaciones = inject(NotificacionService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly textos = TEXTOS_PENDIENTE;
  protected readonly cargando = signal(false);
  protected readonly error = signal(false);
  protected readonly autorizacion = signal<MiAutorizacion | null>(null);
  protected readonly revisando = signal(false);
  /** Solo tras pulsar «Ya lo autorizó, revisar» sin que la cuenta esté activa. */
  protected readonly sinRespuesta = signal(false);
  protected readonly reenviando = signal(false);
  protected readonly cerrando = signal(false);
  protected readonly mostrarOtroCorreo = signal(false);
  protected readonly errorReenvio = signal<string | null>(null);
  private readonly cuenta = crearCuentaRegresiva();
  /** Segundos que faltan para poder reenviar (cuenta regresiva). */
  protected readonly espera = this.cuenta.espera;

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      propio: [this.sesion.usuario()?.correo ?? ''],
      correo: ['', [Validators.required, correoValidator()]],
    },
    { validators: [correosDistintosValidator('propio', 'correo')] },
  );

  protected readonly estado = computed(() => this.autorizacion()?.estado ?? null);
  protected readonly textoEspera = computed(() =>
    this.textos.podrasReenviar(formatearCuenta(this.espera())),
  );
  protected readonly mensaje = computed(() => {
    const a = this.autorizacion();
    switch (a?.estado) {
      case 'PENDIENTE':
        return a.correo_acudiente_enmascarado
          ? this.textos.pendiente(a.correo_acudiente_enmascarado)
          : this.textos.pendienteSinCorreo;
      case 'RECHAZADA':
        return this.textos.rechazada;
      case 'EXPIRADA':
        return this.textos.expirada;
      case 'REVOCADA':
        return this.textos.revocada;
      case 'SIN_SOLICITUD':
        return this.textos.sinSolicitud;
      default:
        return null;
    }
  });
  /** Reenviar al mismo correo solo tiene sentido si hubo un envío y no fue rechazado. */
  protected readonly puedeReenviarMismo = computed(() => {
    const estado = this.estado();
    return estado === 'PENDIENTE' || estado === 'EXPIRADA' || estado === 'REVOCADA';
  });

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.error.set(false);
    this.api
      .mia()
      .pipe(conIndicador(this.cargando))
      .subscribe({
        next: (autorizacion) => {
          if (autorizacion.estado === 'DESCONOCIDO') {
            this.error.set(true);
            return;
          }
          this.autorizacion.set(autorizacion);
          this.cuenta.iniciar(autorizacion.puede_reenviar_en_segundos);
          if (autorizacion.estado === 'AUTORIZADA') {
            this.revisar(false);
          } else if (autorizacion.estado === 'SIN_SOLICITUD') {
            this.mostrarOtroCorreo.set(true);
          }
        },
        error: () => this.error.set(true),
      });
  }

  /** Restaura la sesión y, si ya hay otro paso (o la cuenta está completa), va allá de inmediato. */
  protected revisar(manual = true): void {
    if (this.revisando()) {
      return;
    }
    this.revisando.set(true);
    this.sinRespuesta.set(false);
    void this.sesion.restaurar().then((usuario) => {
      this.revisando.set(false);
      if (!usuario) {
        void this.router.navigateByUrl('/login');
        return;
      }
      const paso = siguientePaso(usuario);
      if (paso !== RUTA_PENDIENTE) {
        if (paso === destinoPostRegistro()) {
          this.notificaciones.exito(this.textos.activa);
        }
        void this.router.navigateByUrl(paso);
      } else if (manual) {
        this.sinRespuesta.set(true);
      }
    });
  }

  protected reenviar(): void {
    this.sinRespuesta.set(false);
    this.enviar();
  }

  protected alternarOtroCorreo(): void {
    this.errorReenvio.set(null);
    this.mostrarOtroCorreo.update((visible) => !visible);
  }

  protected enviarOtroCorreo(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      enfocarPrimerError(this.host.nativeElement);
      return;
    }
    this.enviar(normalizarCorreo(this.form.getRawValue().correo));
  }

  protected cerrarSesion(): void {
    this.cerrando.set(true);
    this.sesion.cerrar().subscribe({
      complete: () => void this.router.navigateByUrl('/login'),
      error: () => void this.router.navigateByUrl('/login'),
    });
  }

  private enviar(correo?: string): void {
    if (this.espera() > 0 || this.reenviando()) {
      return;
    }
    this.errorReenvio.set(null);
    this.api
      .reenviar(correo)
      .pipe(conIndicador(this.reenviando))
      .subscribe({
        next: () => {
          this.notificaciones.exito(this.textos.reenviado);
          this.mostrarOtroCorreo.set(false);
          this.form.controls.correo.reset('');
          this.cargar();
        },
        error: (e: unknown) => this.manejarErrorReenvio(comoApiError(e)),
      });
  }

  private manejarErrorReenvio(error: ApiError): void {
    if (tieneCodigo(error, 'DEMASIADAS_SOLICITUDES') || error.status === 429) {
      this.cuenta.iniciar(error.reintentarEnSegundos ?? ESPERA_POR_DEFECTO);
      this.errorReenvio.set(this.textos.demasiadas);
      return;
    }
    if (this.mostrarOtroCorreo()) {
      const c = this.form.controls;
      if (tieneCodigo(error, 'CORREO_ACUDIENTE_INVALIDO', 'CORREO_ACUDIENTE_REQUERIDO')) {
        marcarControles([c.correo], error.mensaje);
        enfocarPrimerError(this.host.nativeElement);
        return;
      }
      if (aplicarErroresServidor(this.form, error)) {
        enfocarPrimerError(this.host.nativeElement);
        return;
      }
    }
    this.errorReenvio.set(error.mensaje);
  }
}
