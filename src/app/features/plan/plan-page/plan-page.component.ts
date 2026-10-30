import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ActividadApiService } from '../../../core/api/actividad-api.service';
import { ArchivoApiService } from '../../../core/api/archivo-api.service';
import { ConversacionApiService } from '../../../core/api/conversacion-api.service';
import { PlanApiService } from '../../../core/api/plan-api.service';
import { CapacidadesService } from '../../../core/auth/capacidades.service';
import {
  ActividadPublica,
  ActualizarActividadEntrada,
  EstadoActividad,
  PlanDetalle,
  Uuid,
  comoApiError,
} from '../../../core/models';
import { AvisoErrorComponent } from '../../../shared/ui/aviso-error/aviso-error.component';
import { BarraProgresoComponent } from '../../../shared/ui/barra-progreso/barra-progreso.component';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { EstadoVacioComponent } from '../../../shared/ui/estado-vacio/estado-vacio.component';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { InsigniaNivelComponent } from '../../../shared/ui/insignia-nivel/insignia-nivel.component';
import { ListaReferenciasComponent } from '../../../shared/ui/lista-referencias/lista-referencias.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { TarjetaComponent } from '../../../shared/ui/tarjeta/tarjeta.component';
import { AvisoPagina, avisoDeError } from '../../../shared/utils/aviso-error';
import { conIndicador } from '../../../shared/utils/con-indicador';
import { fuenteAReferencia } from '../../../shared/utils/referencias';
import {
  ActividadItemComponent,
  EntregaArchivo,
  EstadoGuardado,
} from '../actividad-item/actividad-item.component';
import { TEXTOS_PLAN } from '../plan.textos';

@Component({
  selector: 'app-plan-page',
  imports: [
    ActividadItemComponent,
    AvisoErrorComponent,
    BarraProgresoComponent,
    BotonComponent,
    EstadoVacioComponent,
    IconoComponent,
    InsigniaNivelComponent,
    ListaReferenciasComponent,
    SpinnerComponent,
    TarjetaComponent,
  ],
  templateUrl: './plan-page.component.html',
  styleUrl: './plan-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanPageComponent implements OnInit {
  readonly idPlan = input.required<string>();

  private readonly planApi = inject(PlanApiService);
  private readonly actividadApi = inject(ActividadApiService);
  private readonly archivoApi = inject(ArchivoApiService);
  private readonly conversacionApi = inject(ConversacionApiService);
  private readonly capacidades = inject(CapacidadesService);
  private readonly router = inject(Router);

  protected readonly textos = TEXTOS_PLAN;
  protected readonly plan = signal<PlanDetalle | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal(false);
  protected readonly abriendoTutor = signal(false);
  protected readonly avisoTutor = signal<AvisoPagina | null>(null);
  protected readonly guardado = signal<Readonly<Record<Uuid, EstadoGuardado>>>({});
  protected readonly entregas = signal<Readonly<Record<Uuid, EntregaArchivo>>>({});

  protected readonly fuentes = computed(() => (this.plan()?.fuentes ?? []).map(fuenteAReferencia));
  protected readonly actividades = computed(() =>
    [...(this.plan()?.actividades ?? [])].sort((a, b) => a.numero_orden - b.numero_orden),
  );
  protected readonly completadas = computed(
    () => this.actividades().filter((a) => a.estado === 'COMPLETADA').length,
  );
  protected readonly textoProgreso = computed(() =>
    this.textos.progreso(this.completadas(), this.actividades().length),
  );
  protected readonly urlsArchivo = computed(() => {
    const urls: Record<Uuid, string> = {};
    for (const a of this.actividades()) {
      if (a.archivo) {
        urls[a.id_actividad] = this.archivoApi.urlContenido(a.archivo.id_archivo);
      }
    }
    return urls;
  });
  /** Refleja el cupo diario que informa el backend; no decide nada. */
  protected readonly sinCupoArchivos = computed(
    () => this.capacidades.limites()?.archivos_restantes_hoy === 0,
  );

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.error.set(false);
    this.planApi
      .obtener(this.idPlan())
      .pipe(conIndicador(this.cargando))
      .subscribe({
        next: (plan) => this.plan.set(plan),
        error: () => this.error.set(true),
      });
  }

  protected cambiarEstado(actividad: ActividadPublica, estado: EstadoActividad): void {
    this.actualizar(actividad.id_actividad, { estado });
  }

  protected guardarRespuesta(actividad: ActividadPublica, respuesta: string): void {
    this.actualizar(actividad.id_actividad, {
      estado: actividad.estado,
      respuesta_usuario: respuesta,
    });
  }

  protected adjuntar(actividad: ActividadPublica, archivo: File): void {
    const id = actividad.id_actividad;
    this.fijarEntrega(id, { archivo, progreso: 0, error: null });
    this.archivoApi.subir(archivo, 'ACTIVIDAD', id).subscribe({
      next: (evento) => {
        if (evento.tipo === 'progreso') {
          this.fijarEntrega(id, { archivo, progreso: evento.porcentaje, error: null });
        } else {
          this.actualizar(
            id,
            { estado: actividad.estado, id_archivo: evento.archivo.id_archivo },
            () => {
              this.quitarEntrega(id);
              this.capacidades.refrescar();
            },
          );
        }
      },
      // El archivo elegido se conserva para poder reintentar.
      error: (e: unknown) =>
        this.fijarEntrega(id, { archivo, progreso: null, error: comoApiError(e).mensaje }),
    });
  }

  protected quitarArchivo(actividad: ActividadPublica): void {
    const id = actividad.id_actividad;
    if (!actividad.archivo) {
      this.quitarEntrega(id);
      return;
    }
    this.archivoApi.eliminar(actividad.archivo.id_archivo).subscribe({
      next: () => this.reemplazarActividad({ ...actividad, archivo: null }),
      error: () => undefined,
    });
  }

  protected preguntarTutor(): void {
    this.avisoTutor.set(null);
    this.conversacionApi
      .crear({ id_plan: this.idPlan() })
      .pipe(conIndicador(this.abriendoTutor))
      .subscribe({
        next: (conversacion) => void this.router.navigate(['/tutor', conversacion.id_conversacion]),
        error: (e: unknown) => this.avisoTutor.set(avisoDeError(comoApiError(e))),
      });
  }

  private actualizar(id: Uuid, datos: ActualizarActividadEntrada, alTerminar?: () => void): void {
    this.fijarGuardado(id, 'guardando');
    const peticion: Observable<ActividadPublica> = this.actividadApi.actualizar(id, datos);
    peticion.subscribe({
      next: (actividad) => {
        this.reemplazarActividad(actividad);
        this.fijarGuardado(id, 'guardado');
        alTerminar?.();
      },
      error: (e: unknown) => {
        this.fijarGuardado(id, 'error');
        const archivo = this.entregas()[id]?.archivo ?? null;
        if (archivo) {
          this.fijarEntrega(id, { archivo, progreso: null, error: comoApiError(e).mensaje });
        }
      },
    });
  }

  private reemplazarActividad(actividad: ActividadPublica): void {
    this.plan.update((plan) =>
      plan
        ? {
            ...plan,
            actividades: plan.actividades.map((a) =>
              a.id_actividad === actividad.id_actividad ? actividad : a,
            ),
          }
        : plan,
    );
  }

  private fijarGuardado(id: Uuid, estado: EstadoGuardado): void {
    this.guardado.update((mapa) => ({ ...mapa, [id]: estado }));
  }

  private fijarEntrega(id: Uuid, entrega: EntregaArchivo): void {
    this.entregas.update((mapa) => ({ ...mapa, [id]: entrega }));
  }

  private quitarEntrega(id: Uuid): void {
    this.entregas.update((mapa) => {
      const { [id]: _quitada, ...resto } = mapa;
      return resto;
    });
  }
}
