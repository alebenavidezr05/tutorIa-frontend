import {
  ChangeDetectionStrategy,
  Component,
  LOCALE_ID,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { formatDate } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PrivacidadApiService } from '../../../core/api/privacidad-api.service';
import {
  ConsentimientoPublico,
  Finalidad,
  MisDatos,
  PoliticaPublica,
  SolicitudEntrada,
  SolicitudPublica,
} from '../../../core/models';
import { NotificacionService } from '../../../core/notificaciones/notificacion.service';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { DialogoConfirmacionComponent } from '../../../shared/ui/dialogo-confirmacion/dialogo-confirmacion.component';
import { TarjetaComponent } from '../../../shared/ui/tarjeta/tarjeta.component';
import { conIndicador } from '../../../shared/utils/con-indicador';
import { descargarBlob, nombreConFecha } from '../../../shared/utils/descargar-archivo';
import { TEXTOS_PRIVACIDAD } from '../privacidad.textos';
import {
  CambioConsentimiento,
  SeccionAutorizacionesComponent,
} from '../secciones/seccion-autorizaciones.component';
import { SeccionMisDatosComponent } from '../secciones/seccion-mis-datos.component';
import { SeccionSolicitudesComponent } from '../secciones/seccion-solicitudes.component';

@Component({
  selector: 'app-privacidad-page',
  imports: [
    RouterLink,
    BotonComponent,
    DialogoConfirmacionComponent,
    TarjetaComponent,
    SeccionAutorizacionesComponent,
    SeccionMisDatosComponent,
    SeccionSolicitudesComponent,
  ],
  templateUrl: './privacidad-page.component.html',
  styles: `
    app-tarjeta {
      margin-bottom: var(--espacio-5);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacidadPageComponent implements OnInit {
  private readonly api = inject(PrivacidadApiService);
  private readonly notificaciones = inject(NotificacionService);
  private readonly locale = inject(LOCALE_ID);

  protected readonly textos = TEXTOS_PRIVACIDAD;
  protected readonly politica = signal<PoliticaPublica | null>(null);
  protected readonly consentimientos = signal<readonly ConsentimientoPublico[]>([]);
  protected readonly misDatos = signal<MisDatos | null>(null);
  protected readonly errorMisDatos = signal(false);
  protected readonly solicitudes = signal<readonly SolicitudPublica[]>([]);
  protected readonly guardandoFinalidad = signal<Finalidad | null>(null);
  protected readonly descargando = signal(false);
  protected readonly enviandoSolicitud = signal(false);
  protected readonly solicitudesCreadas = signal(0);
  protected readonly confirmacion = signal<string | null>(null);
  protected readonly dialogo = signal<'ninguno' | 'personalizacion' | 'eliminar'>('ninguno');

  ngOnInit(): void {
    this.api.politica().subscribe({ next: (p) => this.politica.set(p), error: () => undefined });
    this.api
      .consentimientos()
      .subscribe({ next: (c) => this.consentimientos.set(c), error: () => undefined });
    this.api
      .solicitudes()
      .subscribe({ next: (s) => this.solicitudes.set(s), error: () => undefined });
    this.api.misDatos().subscribe({
      next: (d) => this.misDatos.set(d),
      error: () => this.errorMisDatos.set(true),
    });
  }

  protected alCambiarConsentimiento(cambio: CambioConsentimiento): void {
    // Revocar la personalización se explica y se confirma antes.
    if (cambio.finalidad === 'PERSONALIZACION' && !cambio.otorgado) {
      this.dialogo.set('personalizacion');
      return;
    }
    this.guardarConsentimiento(cambio);
  }

  protected confirmarSinPersonalizacion(): void {
    this.dialogo.set('ninguno');
    this.guardarConsentimiento({ finalidad: 'PERSONALIZACION', otorgado: false });
  }

  protected cerrarDialogo(): void {
    this.dialogo.set('ninguno');
  }

  protected abrirEliminar(): void {
    this.dialogo.set('eliminar');
  }

  protected descargar(): void {
    this.api
      .exportar()
      .pipe(conIndicador(this.descargando))
      .subscribe({
        next: (blob) => {
          descargarBlob(blob, nombreConFecha('mis-datos-tutoria', 'json'));
          this.notificaciones.exito(this.textos.misDatos.descargado);
        },
        error: () => undefined,
      });
  }

  protected crearSolicitud(entrada: SolicitudEntrada): void {
    this.api
      .crearSolicitud(entrada)
      .pipe(conIndicador(this.enviandoSolicitud))
      .subscribe({
        next: (solicitud) => {
          this.dialogo.set('ninguno');
          this.solicitudes.update((lista) => [solicitud, ...lista]);
          this.solicitudesCreadas.update((n) => n + 1);
          const fecha = formatDate(solicitud.fecha_limite, 'longDate', this.locale);
          this.confirmacion.set(this.textos.solicitudes.creada(fecha));
        },
        error: () => undefined,
      });
  }

  protected solicitarEliminacion(): void {
    this.crearSolicitud({ tipo: 'SUPRESION', detalle: this.textos.eliminar.detalle });
  }

  private guardarConsentimiento(cambio: CambioConsentimiento): void {
    const version = this.politica()?.version;
    if (!version) {
      return;
    }
    this.guardandoFinalidad.set(cambio.finalidad);
    this.api.cambiarConsentimiento({ ...cambio, version_politica: version }).subscribe({
      next: (actualizado) => {
        this.guardandoFinalidad.set(null);
        this.consentimientos.update((lista) =>
          lista.map((c) => (c.finalidad === actualizado.finalidad ? actualizado : c)),
        );
      },
      error: () => this.guardandoFinalidad.set(null),
    });
  }
}
