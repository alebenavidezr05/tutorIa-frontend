import { DatePipe, Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { AutorizacionApiService } from '../../../core/api/autorizacion-api.service';
import { AutorizacionPublica, comoApiError, tieneCodigo } from '../../../core/models';
import { NotificacionService } from '../../../core/notificaciones/notificacion.service';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { DialogoConfirmacionComponent } from '../../../shared/ui/dialogo-confirmacion/dialogo-confirmacion.component';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { TarjetaComponent } from '../../../shared/ui/tarjeta/tarjeta.component';
import { conIndicador } from '../../../shared/utils/con-indicador';
import { TEXTOS_CONFIRMAR } from '../autorizacion.textos';
import { leerTokenDeFragmento } from '../leer-token';

export type VistaConfirmacion =
  | { tipo: 'cargando' }
  | { tipo: 'sin-token' }
  | { tipo: 'invalida' }
  | { tipo: 'error' }
  | { tipo: 'autorizacion'; datos: AutorizacionPublica };

type Dialogo = 'ninguno' | 'no-autorizo' | 'revocar';

/**
 * Pantalla pública del acudiente. El token llega en el FRAGMENTO (`#token=…`), que nunca viaja al
 * servidor: se lee una vez, se guarda en una señal, se borra de la barra de direcciones y solo se
 * envía en el cuerpo de un POST. No usa SesionService ni cookies.
 */
@Component({
  selector: 'app-confirmar-autorizacion-page',
  imports: [
    DatePipe,
    RouterLink,
    BotonComponent,
    DialogoConfirmacionComponent,
    IconoComponent,
    SpinnerComponent,
    TarjetaComponent,
  ],
  templateUrl: './confirmar-autorizacion-page.component.html',
  styles: `
    .estudiante {
      font-family: var(--fuente-mono);
      font-size: var(--texto-md);
      font-weight: 700;
      overflow-wrap: anywhere;
    }

    .explicacion {
      padding-left: var(--espacio-5);
    }

    .casilla-dialogo {
      display: flex;
      align-items: flex-start;
      gap: var(--espacio-1);
    }

    .casilla-dialogo label {
      padding-block: 10px;
      font-weight: 700;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmarAutorizacionPageComponent implements OnInit {
  private readonly api = inject(AutorizacionApiService);
  private readonly ruta = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly notificaciones = inject(NotificacionService);

  protected readonly textos = TEXTOS_CONFIRMAR;
  /** El token solo vive en memoria. */
  private readonly token = signal<string | null>(null);
  protected readonly vista = signal<VistaConfirmacion>({ tipo: 'cargando' });
  protected readonly procesando = signal(false);
  protected readonly dialogo = signal<Dialogo>('ninguno');
  protected readonly eliminarDatos = signal(false);

  protected readonly autorizacion = computed(() => {
    const vista = this.vista();
    return vista.tipo === 'autorizacion' ? vista.datos : null;
  });

  ngOnInit(): void {
    const token = leerTokenDeFragmento(this.ruta.snapshot.fragment);
    // Se borra el fragmento de la barra de direcciones (history.replaceState).
    this.location.replaceState(this.location.path(false));
    this.token.set(token);
    if (token) {
      this.consultar();
    } else {
      this.vista.set({ tipo: 'sin-token' });
    }
  }

  protected consultar(): void {
    const token = this.token();
    if (!token) {
      return;
    }
    this.vista.set({ tipo: 'cargando' });
    this.ejecutar(this.api.consultar(token));
  }

  protected autorizar(): void {
    const token = this.token();
    if (token) {
      this.ejecutar(this.api.confirmar(token), this.textos.exitoAutorizar);
    }
  }

  protected abrirDialogo(dialogo: Dialogo): void {
    this.eliminarDatos.set(false);
    this.dialogo.set(dialogo);
  }

  protected cerrarDialogo(): void {
    this.dialogo.set('ninguno');
  }

  protected alternarEliminarDatos(evento: Event): void {
    this.eliminarDatos.set((evento.target as HTMLInputElement).checked);
  }

  protected revocar(): void {
    const token = this.token();
    if (token) {
      const eliminar = this.dialogo() === 'revocar' && this.eliminarDatos();
      this.ejecutar(this.api.revocar(token, eliminar), this.textos.exitoRevocar);
    }
  }

  private ejecutar(peticion: Observable<AutorizacionPublica>, exito?: string): void {
    peticion.pipe(conIndicador(this.procesando)).subscribe({
      next: (datos) => {
        this.dialogo.set('ninguno');
        this.vista.set({ tipo: 'autorizacion', datos });
        if (exito) {
          this.notificaciones.exito(exito);
        }
      },
      error: (e: unknown) => {
        this.dialogo.set('ninguno');
        const invalida = tieneCodigo(comoApiError(e), 'AUTORIZACION_INVALIDA');
        this.vista.set({ tipo: invalida ? 'invalida' : 'error' });
      },
    });
  }
}
