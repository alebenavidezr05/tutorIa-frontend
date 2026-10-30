import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ActividadPublica, EstadoActividad } from '../../../core/models';
import { TamanoArchivoPipe } from '../../../shared/pipes/tamano-archivo.pipe';
import { BloqueoPremiumComponent } from '../../../shared/ui/bloqueo-premium/bloqueo-premium.component';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { SelectorArchivoComponent } from '../../../shared/ui/selector-archivo/selector-archivo.component';
import { LONGITUD_MAX_RESPUESTA_ACTIVIDAD } from '../../../shared/validators';
import { ESTADO_ACTIVIDAD, TEXTOS_ACTIVIDAD } from '../plan.textos';

export type EstadoGuardado = 'guardando' | 'guardado' | 'error';

/** Estado local de la entrega de archivo de una actividad (lo mantiene la página). */
export interface EntregaArchivo {
  readonly archivo: File | null;
  readonly progreso: number | null;
  readonly error: string | null;
}

@Component({
  selector: 'app-actividad-item',
  imports: [
    TamanoArchivoPipe,
    BloqueoPremiumComponent,
    BotonComponent,
    IconoComponent,
    SelectorArchivoComponent,
  ],
  templateUrl: './actividad-item.component.html',
  styleUrl: './actividad-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActividadItemComponent {
  readonly actividad = input.required<ActividadPublica>();
  /** `true` solo en el nivel Avanzado (lo decide el backend). */
  readonly aceptaArchivos = input(false);
  readonly sinCupoArchivos = input(false);
  readonly estadoGuardado = input<EstadoGuardado | null>(null);
  readonly entrega = input<EntregaArchivo | null>(null);
  readonly urlArchivo = input<string | null>(null);
  readonly cambiarEstado = output<EstadoActividad>();
  readonly guardarRespuesta = output<string>();
  readonly adjuntar = output<File>();
  readonly quitarArchivo = output<void>();

  protected readonly textos = TEXTOS_ACTIVIDAD;
  protected readonly maximo = LONGITUD_MAX_RESPUESTA_ACTIVIDAD;
  protected readonly nombresEstado = ESTADO_ACTIVIDAD;

  private readonly idBase = computed(() => `actividad-${this.actividad().id_actividad}`);
  protected readonly idTitulo = computed(() => `${this.idBase()}-titulo`);
  protected readonly idRespuesta = computed(() => `${this.idBase()}-respuesta`);
  protected readonly idGuardado = computed(() => `${this.idBase()}-guardado`);
  protected readonly claseEstado = computed(
    () => `actividad--${this.actividad().estado.toLowerCase()}`,
  );
  protected readonly titulo = computed(() => this.textos.actividad(this.actividad().numero_orden));
  protected readonly textoGuardado = computed(() => {
    switch (this.estadoGuardado()) {
      case 'guardando':
        return this.textos.guardando;
      case 'guardado':
        return this.textos.guardado;
      case 'error':
        return this.textos.errorGuardar;
      default:
        return '';
    }
  });
  protected readonly subiendo = computed(() => this.entrega()?.progreso != null);

  protected alSalirDelCampo(evento: Event): void {
    const texto = (evento.target as HTMLTextAreaElement).value;
    if (texto !== (this.actividad().respuesta_usuario ?? '')) {
      this.guardarRespuesta.emit(texto);
    }
  }

  protected reintentarSubida(): void {
    const archivo = this.entrega()?.archivo;
    if (archivo) {
      this.adjuntar.emit(archivo);
    }
  }
}
