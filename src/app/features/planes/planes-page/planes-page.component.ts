import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { environment } from '../../../../environments/environment';
import { SuscripcionApiService } from '../../../core/api/suscripcion-api.service';
import { CapacidadesService } from '../../../core/auth/capacidades.service';
import { comoApiError } from '../../../core/models';
import { NotificacionService } from '../../../core/notificaciones/notificacion.service';
import { AvisoErrorComponent } from '../../../shared/ui/aviso-error/aviso-error.component';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { TarjetaComponent } from '../../../shared/ui/tarjeta/tarjeta.component';
import { AvisoPagina, avisoDeError } from '../../../shared/utils/aviso-error';
import { conIndicador } from '../../../shared/utils/con-indicador';
import { PLANES, TEXTOS_PLANES } from '../planes.textos';

@Component({
  selector: 'app-planes-page',
  imports: [
    CurrencyPipe,
    DatePipe,
    AvisoErrorComponent,
    BotonComponent,
    IconoComponent,
    TarjetaComponent,
  ],
  templateUrl: './planes-page.component.html',
  styleUrl: './planes-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanesPageComponent implements OnInit {
  private readonly api = inject(SuscripcionApiService);
  private readonly notificaciones = inject(NotificacionService);
  private readonly documento = inject(DOCUMENT);
  protected readonly capacidades = inject(CapacidadesService);

  protected readonly textos = TEXTOS_PLANES;
  protected readonly planes = PLANES;
  /** Solo para mostrar: el backend es la fuente de verdad del precio. */
  protected readonly precio = environment.precioPremiumAnualCop;
  protected readonly redirigiendo = signal(false);
  protected readonly aviso = signal<AvisoPagina | null>(null);

  ngOnInit(): void {
    // Se refresca al entrar (también al volver de la pasarela de pago).
    this.capacidades.refrescar();
  }

  protected mejorar(): void {
    this.aviso.set(null);
    this.api
      .iniciarCheckout()
      .pipe(conIndicador(this.redirigiendo))
      .subscribe({
        next: ({ url_pago }) => {
          if (/^https:\/\//.test(url_pago)) {
            this.redirigiendo.set(true);
            this.documento.defaultView?.location.assign(url_pago);
          } else {
            this.notificaciones.error(this.textos.urlInvalida);
          }
        },
        error: (e: unknown) => this.aviso.set(avisoDeError(comoApiError(e))),
      });
  }
}
