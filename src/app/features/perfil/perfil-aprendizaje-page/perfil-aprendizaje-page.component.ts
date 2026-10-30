import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { PerfilAprendizajeApiService } from '../../../core/api/perfil-aprendizaje-api.service';
import { PerfilAprendizajePublico } from '../../../core/models';
import { NotificacionService } from '../../../core/notificaciones/notificacion.service';
import { BarraProgresoComponent } from '../../../shared/ui/barra-progreso/barra-progreso.component';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { DialogoConfirmacionComponent } from '../../../shared/ui/dialogo-confirmacion/dialogo-confirmacion.component';
import { EstadoVacioComponent } from '../../../shared/ui/estado-vacio/estado-vacio.component';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { InterruptorComponent } from '../../../shared/ui/interruptor/interruptor.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { TarjetaComponent } from '../../../shared/ui/tarjeta/tarjeta.component';
import { conIndicador } from '../../../shared/utils/con-indicador';
import { NOMBRE_DETALLE, NOMBRE_RITMO, TEXTOS_APRENDIZAJE } from '../perfil.textos';

type Dialogo = 'ninguno' | 'desactivar' | 'olvidar';

@Component({
  selector: 'app-perfil-aprendizaje-page',
  imports: [
    RouterLink,
    BarraProgresoComponent,
    BotonComponent,
    DialogoConfirmacionComponent,
    EstadoVacioComponent,
    IconoComponent,
    InterruptorComponent,
    SpinnerComponent,
    TarjetaComponent,
  ],
  templateUrl: './perfil-aprendizaje-page.component.html',
  styleUrl: './perfil-aprendizaje-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerfilAprendizajePageComponent implements OnInit {
  private readonly api = inject(PerfilAprendizajeApiService);
  private readonly notificaciones = inject(NotificacionService);

  protected readonly textos = TEXTOS_APRENDIZAJE;
  protected readonly perfil = signal<PerfilAprendizajePublico | null>(null);
  protected readonly cargando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal(false);
  protected readonly dialogo = signal<Dialogo>('ninguno');

  /** Barras siempre acompañadas de porcentaje y texto (nunca solo color). */
  protected readonly formatos = computed(() =>
    [...(this.perfil()?.formatos ?? [])]
      .sort((a, b) => b.puntaje - a.puntaje)
      .map((f) => {
        const porcentaje = Math.round(f.puntaje * 100);
        return {
          clave: f.formato,
          porcentaje,
          etiqueta: this.textos.porcentaje(f.etiqueta_legible, porcentaje),
        };
      }),
  );
  protected readonly detalle = computed(() => {
    const valor = this.perfil()?.detalle ?? '';
    return NOMBRE_DETALLE[valor] ?? valor;
  });
  protected readonly ritmo = computed(() => {
    const valor = this.perfil()?.ritmo ?? '';
    return NOMBRE_RITMO[valor] ?? valor;
  });
  protected readonly textoInteracciones = computed(() =>
    this.textos.interacciones(this.perfil()?.total_interacciones ?? 0),
  );

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.error.set(false);
    this.api
      .obtener()
      .pipe(conIndicador(this.cargando))
      .subscribe({
        next: (perfil) => this.perfil.set(perfil),
        error: () => this.error.set(true),
      });
  }

  protected alCambiarPersonalizacion(activa: boolean): void {
    if (activa) {
      this.cambiarPersonalizacion(true);
    } else {
      this.dialogo.set('desactivar');
    }
  }

  protected confirmarDesactivar(): void {
    this.cambiarPersonalizacion(false);
  }

  protected abrirOlvidar(): void {
    this.dialogo.set('olvidar');
  }

  protected cerrarDialogo(): void {
    this.dialogo.set('ninguno');
  }

  protected olvidar(): void {
    this.api
      .reiniciar()
      .pipe(conIndicador(this.guardando))
      .subscribe({
        next: () => {
          this.dialogo.set('ninguno');
          this.notificaciones.exito(this.textos.olvidado);
          this.cargar();
        },
        error: () => this.dialogo.set('ninguno'),
      });
  }

  private cambiarPersonalizacion(activa: boolean): void {
    this.api
      .cambiarPersonalizacion(activa)
      .pipe(conIndicador(this.guardando))
      .subscribe({
        next: (perfil) => {
          this.dialogo.set('ninguno');
          this.perfil.set(perfil);
        },
        error: () => this.dialogo.set('ninguno'),
      });
  }
}
