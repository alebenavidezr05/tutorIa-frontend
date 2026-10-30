import { ErrorHandler, Injectable, inject } from '@angular/core';
import { MENSAJE_ERROR_GENERICO, esApiError } from '../models';
import { NotificacionService } from '../notificaciones/notificacion.service';

/**
 * Último recurso para errores no previstos. Los errores HTTP (`ApiError`) ya los notificó el
 * interceptor, así que aquí solo se registran.
 */
@Injectable()
export class ManejadorErroresGlobal implements ErrorHandler {
  private readonly notificaciones = inject(NotificacionService);

  handleError(error: unknown): void {
    if (esApiError(error)) {
      return;
    }
    console.error('[TutorIA] Error no controlado', error);
    this.notificaciones.error(MENSAJE_ERROR_GENERICO);
  }
}
