import { ChangeDetectionStrategy, Component, DOCUMENT, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RUTA_INICIO } from '../../../core/auth/auth.guard';
import { SesionService } from '../../../core/auth/sesion.service';
import { NotificacionService } from '../../../core/notificaciones/notificacion.service';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { copiarAlPortapapeles } from '../../../shared/utils/portapapeles';
import { PrellenadoAutorizacionService } from '../../autorizacion/prellenado-autorizacion.service';
import { TEXTOS_PENDIENTE } from '../auth.textos';

@Component({
  selector: 'app-pendiente-autorizacion-page',
  imports: [BotonComponent, IconoComponent],
  templateUrl: './pendiente-autorizacion-page.component.html',
  styles: `
    .pasos {
      padding-left: var(--espacio-5);
    }

    .enlace-acudiente {
      display: block;
      padding: var(--espacio-3);
      border: 1px solid var(--color-borde-control);
      border-radius: var(--radio-md);
      background: var(--color-superficie);
      font-family: var(--fuente-mono);
      overflow-wrap: anywhere;
    }

    .acciones {
      margin-block: var(--espacio-4);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PendienteAutorizacionPageComponent {
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);
  private readonly notificaciones = inject(NotificacionService);
  private readonly prellenado = inject(PrellenadoAutorizacionService);
  private readonly documento = inject(DOCUMENT);

  protected readonly textos = TEXTOS_PENDIENTE;
  protected readonly revisando = signal(false);
  protected readonly cerrando = signal(false);
  protected readonly enlace = `${this.documento.location.origin}/autorizacion`;

  protected revisar(): void {
    this.revisando.set(true);
    void this.sesion.restaurar().then((usuario) => {
      this.revisando.set(false);
      if (usuario?.estado_cuenta === 'ACTIVA') {
        this.notificaciones.exito(this.textos.activa);
        void this.router.navigateByUrl(RUTA_INICIO);
      } else if (usuario) {
        this.notificaciones.info(this.textos.sigue);
      } else {
        void this.router.navigateByUrl('/login');
      }
    });
  }

  protected copiarEnlace(): void {
    void copiarAlPortapapeles(this.enlace, this.documento).then((copiado) => {
      if (copiado) {
        this.notificaciones.exito(this.textos.copiado);
      }
    });
  }

  protected abrirAutorizacion(): void {
    const correo = this.sesion.usuario()?.correo;
    if (correo) {
      this.prellenado.establecer(correo);
    }
    void this.router.navigateByUrl('/autorizacion');
  }

  protected cerrarSesion(): void {
    this.cerrando.set(true);
    this.sesion.cerrar().subscribe({
      complete: () => void this.router.navigateByUrl('/login'),
      error: () => void this.router.navigateByUrl('/login'),
    });
  }
}
