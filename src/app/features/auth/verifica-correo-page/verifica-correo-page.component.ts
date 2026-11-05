import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthApiService } from '../../../core/api/auth-api.service';
import { AutorizacionApiService } from '../../../core/api/autorizacion-api.service';
import { RUTA_VERIFICAR, siguientePaso } from '../../../core/auth/auth.guard';
import { SesionService } from '../../../core/auth/sesion.service';
import {
  ApiError,
  EstadoVerificacionCorreo,
  MiAutorizacion,
  comoApiError,
  tieneCodigo,
} from '../../../core/models';
import { NotificacionService } from '../../../core/notificaciones/notificacion.service';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { VexComponent } from '../../../shared/ui/vex/vex.component';
import { conIndicador } from '../../../shared/utils/con-indicador';
import { crearCuentaRegresiva, formatearCuenta } from '../../../shared/utils/cuenta-regresiva';
import { TEXTOS_VERIFICA_CORREO } from '../auth.textos';

/** Espera por defecto si un 429 no trae `Retry-After`. */
const ESPERA_POR_DEFECTO = 60;
/** Revisión automática mientras la pestaña está visible. */
export const INTERVALO_REVISION_MS = 15_000;

/**
 * Espera a que la persona confirme su correo. Solo refleja lo que dice el backend
 * (`/auth/verificar-correo/estado` y `/auth/me`); el siguiente paso lo decide `siguientePaso`.
 */
@Component({
  selector: 'app-verifica-correo-page',
  imports: [BotonComponent, IconoComponent, VexComponent],
  templateUrl: './verifica-correo-page.component.html',
  styles: `
    .verifica__cabecera {
      display: flex;
      align-items: center;
      gap: var(--espacio-3);
      margin-bottom: var(--espacio-4);

      h1 {
        margin: 0;
      }
    }

    .verifica__pasos {
      margin-block: var(--espacio-4);
      padding-inline-start: var(--espacio-5);
      font-size: var(--texto-sm);
      color: var(--color-texto-suave);

      li + li {
        margin-top: var(--espacio-1);
      }
    }

    .verifica__paso--actual {
      color: var(--color-texto);
      font-weight: 600;
    }

    .acciones {
      margin-block: var(--espacio-4);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificaCorreoPageComponent implements OnInit {
  private readonly authApi = inject(AuthApiService);
  private readonly autorizacionApi = inject(AutorizacionApiService);
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);
  private readonly notificaciones = inject(NotificacionService);
  private readonly documento = inject(DOCUMENT);

  protected readonly textos = TEXTOS_VERIFICA_CORREO;
  protected readonly cargando = signal(false);
  protected readonly error = signal(false);
  protected readonly estado = signal<EstadoVerificacionCorreo | null>(null);
  protected readonly revisando = signal(false);
  protected readonly reenviando = signal(false);
  protected readonly cerrando = signal(false);
  /** Solo tras pulsar «Ya lo confirmé, revisar» sin que el correo esté confirmado. */
  protected readonly sinConfirmar = signal(false);
  protected readonly errorReenvio = signal<string | null>(null);
  protected readonly autorizacion = signal<MiAutorizacion | null>(null);
  protected readonly esMenor = computed(() => this.sesion.usuario()?.es_menor === true);

  private readonly cuenta = crearCuentaRegresiva();
  protected readonly espera = this.cuenta.espera;
  protected readonly textoEspera = computed(() =>
    this.textos.podrasReenviar(formatearCuenta(this.espera())),
  );
  protected readonly estadoAutorizacion = computed(() => {
    const estado = this.autorizacion()?.estado;
    return estado ? (this.textos.estadoAutorizacion[estado] ?? null) : null;
  });

  /** Evita navegar dos veces (clic + revisión automática). */
  private navegando = false;
  private sondeo: ReturnType<typeof setInterval> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.detenerSondeo());
  }

  ngOnInit(): void {
    this.cargar();
    if (this.esMenor()) {
      this.autorizacionApi.mia().subscribe({
        next: (a) => this.autorizacion.set(a),
        error: () => this.autorizacion.set(null),
      });
    }
    this.sondeo = setInterval(() => {
      if (this.documento.visibilityState === 'visible') {
        this.revisar(false);
      }
    }, INTERVALO_REVISION_MS);
  }

  protected cargar(): void {
    this.error.set(false);
    this.authApi
      .estadoVerificacion()
      .pipe(conIndicador(this.cargando))
      .subscribe({
        next: (estado) => {
          if (estado.correo_verificado) {
            this.revisar(false);
            return;
          }
          this.estado.set(estado);
          this.cuenta.iniciar(estado.puede_reenviar_en_segundos);
        },
        error: () => this.error.set(true),
      });
  }

  /** Restaura la sesión y va al siguiente paso si el correo ya está confirmado. */
  protected revisar(manual = true): void {
    if (this.revisando() || this.navegando) {
      return;
    }
    this.revisando.set(true);
    if (manual) {
      this.sinConfirmar.set(false);
    }
    void this.sesion.restaurar().then((usuario) => {
      this.revisando.set(false);
      if (this.navegando) {
        return;
      }
      if (!usuario) {
        this.navegar('/login');
        return;
      }
      const paso = siguientePaso(usuario);
      if (paso !== RUTA_VERIFICAR) {
        this.notificaciones.exito(this.textos.confirmado);
        this.navegar(paso);
      } else if (manual) {
        this.sinConfirmar.set(true);
      }
    });
  }

  protected reenviar(): void {
    if (this.espera() > 0 || this.reenviando()) {
      return;
    }
    this.errorReenvio.set(null);
    this.sinConfirmar.set(false);
    this.authApi
      .reenviarVerificacion()
      .pipe(conIndicador(this.reenviando))
      .subscribe({
        next: () => {
          this.notificaciones.exito(this.textos.reenviado);
          this.cargar(); // la nueva espera la dice el backend
        },
        error: (e: unknown) => this.manejarErrorReenvio(comoApiError(e)),
      });
  }

  protected cerrarSesion(): void {
    this.cerrando.set(true);
    this.detenerSondeo();
    this.sesion.cerrar().subscribe({
      complete: () => this.navegar('/login'),
      error: () => this.navegar('/login'),
    });
  }

  private manejarErrorReenvio(error: ApiError): void {
    if (tieneCodigo(error, 'DEMASIADAS_SOLICITUDES') || error.status === 429) {
      this.cuenta.iniciar(error.reintentarEnSegundos ?? ESPERA_POR_DEFECTO);
      this.errorReenvio.set(this.textos.demasiadas);
    } else if (tieneCodigo(error, 'CORREO_YA_VERIFICADO')) {
      this.revisar(false);
    } else {
      this.errorReenvio.set(this.textos.neutro);
    }
  }

  private navegar(ruta: string): void {
    if (this.navegando) {
      return;
    }
    this.navegando = true;
    this.detenerSondeo();
    void this.router.navigateByUrl(ruta);
  }

  private detenerSondeo(): void {
    if (this.sondeo !== null) {
      clearInterval(this.sondeo);
      this.sondeo = null;
    }
  }
}
