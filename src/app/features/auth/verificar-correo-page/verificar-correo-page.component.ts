import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injectable,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, shareReplay } from 'rxjs';
import { AuthApiService } from '../../../core/api/auth-api.service';
import { siguientePaso } from '../../../core/auth/auth.guard';
import { SesionService } from '../../../core/auth/sesion.service';
import {
  UsuarioPublico,
  VerificacionCorreoRespuesta,
  comoApiError,
  tieneCodigo,
} from '../../../core/models';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { VexComponent } from '../../../shared/ui/vex/vex.component';
import { leerTokenDeFragmento } from '../../autorizacion/leer-token';
import { TEXTOS_VERIFICAR_ENLACE } from '../auth.textos';

/**
 * Guarda el token del enlace SOLO en memoria, para que sobreviva si la pantalla se crea dos veces
 * (la URL ya se limpió la primera vez) y para no enviar dos veces el mismo token.
 */
@Injectable({ providedIn: 'root' })
export class EnlaceVerificacionService {
  private readonly api = inject(AuthApiService);
  private token: string | null = null;
  private envio: { token: string; respuesta: Observable<VerificacionCorreoRespuesta> } | null =
    null;

  /** Toma el token del fragmento (si viene) y devuelve el vigente. */
  tomar(fragmento: string | null | undefined): string | null {
    const delFragmento = leerTokenDeFragmento(fragmento);
    if (delFragmento) {
      this.token = delFragmento;
    }
    return this.token;
  }

  /** Comparte la misma petición entre instancias; si falla, la siguiente llamada reintenta. */
  verificar(token: string): Observable<VerificacionCorreoRespuesta> {
    if (this.envio?.token !== token) {
      this.envio = {
        token,
        respuesta: this.api
          .verificarCorreo(token)
          .pipe(shareReplay({ bufferSize: 1, refCount: false })),
      };
    }
    return this.envio.respuesta;
  }

  olvidar(): void {
    this.token = null;
    this.envio = null;
  }
}

type VistaEnlace = 'cargando' | 'listo' | 'invalido' | 'error';

/** Pantalla pública del enlace «Confirmar mi correo» (`/verificar-correo#token=…`). */
@Component({
  selector: 'app-verificar-correo-page',
  imports: [BotonComponent, IconoComponent, VexComponent],
  templateUrl: './verificar-correo-page.component.html',
  styles: `
    .enlace {
      display: grid;
      justify-items: center;
      gap: var(--espacio-4);
      text-align: center;
    }

    .enlace h1,
    .enlace .alerta {
      margin: 0;
      text-align: start;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificarCorreoPageComponent implements OnInit {
  private readonly enlace = inject(EnlaceVerificacionService);
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly textos = TEXTOS_VERIFICAR_ENLACE;
  protected readonly vista = signal<VistaEnlace>('cargando');
  protected readonly usuario = signal<UsuarioPublico | null>(null);
  protected readonly estadoVex = computed(() => {
    switch (this.vista()) {
      case 'cargando':
        return 'pensando';
      case 'listo':
        return 'celebrando';
      default:
        return 'escuchando';
    }
  });
  /** Se lee una sola vez; luego se borra de la URL. Nunca se guarda en el navegador ni se registra. */
  private readonly token: string | null;

  constructor() {
    const fragmento = inject(ActivatedRoute).snapshot.fragment;
    this.token = this.enlace.tomar(fragmento);
    if (fragmento) {
      const location = inject(Location);
      location.replaceState(location.path(false));
    }
  }

  ngOnInit(): void {
    if (this.token) {
      this.verificar();
    } else {
      this.vista.set('invalido');
    }
  }

  protected verificar(): void {
    const token = this.token;
    if (!token) {
      return;
    }
    this.vista.set('cargando');
    this.enlace
      .verificar(token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (respuesta) => {
          if (respuesta?.estado !== 'VERIFICADO') {
            this.vista.set('error');
            return;
          }
          // Si hay sesión, se actualiza para que el siguiente paso ya vea el correo confirmado.
          void this.sesion.restaurar().then((usuario) => {
            this.usuario.set(usuario);
            this.vista.set('listo');
          });
        },
        error: (e: unknown) => {
          const error = comoApiError(e);
          if (error.status === 404 && tieneCodigo(error, 'VERIFICACION_INVALIDA')) {
            this.enlace.olvidar();
            this.vista.set('invalido');
          } else {
            this.vista.set('error');
          }
        },
      });
  }

  protected continuar(): void {
    const usuario = this.usuario();
    void this.router.navigateByUrl(usuario ? siguientePaso(usuario) : '/login');
  }
}
