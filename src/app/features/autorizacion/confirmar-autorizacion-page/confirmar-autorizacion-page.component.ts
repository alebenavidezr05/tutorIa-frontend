import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AutorizacionApiService } from '../../../core/api/autorizacion-api.service';
import { ApiError, AutorizacionPublica, comoApiError, tieneCodigo } from '../../../core/models';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { DialogoConfirmacionComponent } from '../../../shared/ui/dialogo-confirmacion/dialogo-confirmacion.component';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { TEXTO_ENLACE_EXTERNO } from '../../../shared/ui/textos-ui';
import { conIndicador } from '../../../shared/utils/con-indicador';
import { TEXTOS_CONFIRMAR } from '../autorizacion.textos';
import { leerTokenDeFragmento } from '../leer-token';

export type VistaConfirmacion =
  | { tipo: 'cargando' }
  | { tipo: 'invalida' }
  | { tipo: 'error' }
  | { tipo: 'desconocida' }
  | {
      tipo: 'pendiente' | 'autorizada' | 'rechazada' | 'retirada' | 'revocada' | 'expirada';
      datos: AutorizacionPublica;
    };

/**
 * Estado (ya normalizado por el servicio) → pantalla. «Enlace no válido» queda solo para el 404
 * AUTORIZACION_INVALIDA o la falta de token; un estado desconocido muestra un mensaje neutro.
 */
function _vistaDe(datos: AutorizacionPublica): VistaConfirmacion {
  switch (datos.estado) {
    case 'PENDIENTE':
      return { tipo: 'pendiente', datos };
    case 'AUTORIZADA':
      return { tipo: 'autorizada', datos };
    case 'RECHAZADA':
      return { tipo: 'rechazada', datos };
    case 'REVOCADA':
      return { tipo: 'revocada', datos };
    case 'EXPIRADA':
      return { tipo: 'expirada', datos };
    default:
      return { tipo: 'desconocida' };
  }
}

/**
 * Pantalla pública del adulto responsable: corta, con dos decisiones («Autorizo» / «No autorizo»).
 * El token llega en el FRAGMENTO (`#token=…`), que nunca viaja al servidor: se lee una vez, se
 * guarda en una señal, se borra de la barra de direcciones y solo se envía en el cuerpo de un POST.
 * No usa SesionService, cookies ni almacenamiento.
 */
@Component({
  selector: 'app-confirmar-autorizacion-page',
  imports: [BotonComponent, DialogoConfirmacionComponent, IconoComponent, SpinnerComponent],
  templateUrl: './confirmar-autorizacion-page.component.html',
  styleUrl: './confirmar-autorizacion-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmarAutorizacionPageComponent implements OnInit {
  private readonly api = inject(AutorizacionApiService);
  private readonly ruta = inject(ActivatedRoute);
  private readonly location = inject(Location);

  protected readonly textos = TEXTOS_CONFIRMAR;
  protected readonly textoExterno = TEXTO_ENLACE_EXTERNO;
  /** El token solo vive en memoria. */
  private readonly token = signal<string | null>(null);
  protected readonly vista = signal<VistaConfirmacion>({ tipo: 'cargando' });
  protected readonly procesando = signal(false);
  protected readonly dialogoAbierto = signal(false);
  protected readonly eliminarDatos = signal(false);
  protected readonly avisoPolitica = signal(false);

  protected readonly datos = computed(() => {
    const vista = this.vista();
    return 'datos' in vista ? vista.datos : null;
  });

  ngOnInit(): void {
    const token = leerTokenDeFragmento(this.ruta.snapshot.fragment);
    // Se borra el fragmento de la barra de direcciones (history.replaceState).
    this.location.replaceState(this.location.path(false));
    this.token.set(token);
    if (token) {
      this.consultar();
    } else {
      this.vista.set({ tipo: 'invalida' });
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
    const datos = this.datos();
    if (token && datos) {
      this.avisoPolitica.set(false);
      this.ejecutar(this.api.confirmar(token, datos.version_politica));
    }
  }

  protected rechazar(): void {
    const token = this.token();
    if (token) {
      this.avisoPolitica.set(false);
      this.ejecutar(this.api.rechazar(token));
    }
  }

  protected abrirDialogo(): void {
    this.eliminarDatos.set(false);
    this.dialogoAbierto.set(true);
  }

  protected cerrarDialogo(): void {
    this.dialogoAbierto.set(false);
  }

  protected alternarEliminarDatos(evento: Event): void {
    this.eliminarDatos.set((evento.target as HTMLInputElement).checked);
  }

  protected retirar(): void {
    const token = this.token();
    if (token) {
      this.ejecutar(this.api.revocar(token, this.eliminarDatos()), true);
    }
  }

  private ejecutar(peticion: Observable<AutorizacionPublica>, retiro = false): void {
    peticion.pipe(conIndicador(this.procesando)).subscribe({
      next: (datos) => {
        this.dialogoAbierto.set(false);
        this.vista.set(retiro ? { tipo: 'retirada', datos } : _vistaDe(datos));
      },
      error: (e: unknown) => {
        this.dialogoAbierto.set(false);
        this.manejarError(comoApiError(e));
      },
    });
  }

  private manejarError(error: ApiError): void {
    if (tieneCodigo(error, 'POLITICA_DESACTUALIZADA')) {
      // La política cambió: se recarga el texto nuevo antes de volver a pedir el clic.
      this.consultar();
      this.avisoPolitica.set(true);
      return;
    }
    const invalida = error.status === 404 && tieneCodigo(error, 'AUTORIZACION_INVALIDA');
    this.vista.set({ tipo: invalida ? 'invalida' : 'error' });
  }
}
