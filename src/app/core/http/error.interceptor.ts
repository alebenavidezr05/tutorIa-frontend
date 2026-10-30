import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Injector, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { CapacidadesService } from '../auth/capacidades.service';
import { SesionService } from '../auth/sesion.service';
import { ApiError, CodigoError } from '../models';
import { NotificacionService } from '../notificaciones/notificacion.service';
import { OMITIR_NOTIFICACION } from './contextos';
import { mapearError } from './mapear-error';

export const MENSAJE_ORIGEN_NO_PERMITIDO =
  'Por seguridad no pudimos completar la solicitud. Recarga la página e intenta de nuevo.';

/**
 * Códigos que cada pantalla muestra junto al campo o en su propio panel (§6): el interceptor no
 * muestra notificación genérica para ellos.
 */
export const CODIGOS_EN_PANTALLA: ReadonlySet<CodigoError> = new Set<CodigoError>([
  'CREDENCIALES_INVALIDAS',
  'CORREO_YA_REGISTRADO',
  'LIMITE_PLAN_GRATUITO',
  'LIMITE_USO',
  'CONVERSACION_CERRADA',
  'MENSAJE_NO_PERMITIDO',
  'SESION_YA_EVALUADA',
  'CONSENTIMIENTO_REQUERIDO',
  'POLITICA_DESACTUALIZADA',
  'AUTORIZACION_PENDIENTE',
  'FUNCION_PREMIUM',
  'COMPRA_NO_PERMITIDA',
  'ARCHIVO_NO_PERMITIDO',
  'ARCHIVO_MUY_GRANDE',
  'ARCHIVO_INVALIDO',
  'CONTENIDO_NO_PERMITIDO',
  'TEMA_NO_PERMITIDO',
  'TEMA_SIN_FUENTES',
  'AUTORIZACION_INVALIDA',
  'EDAD_NO_PERMITIDA',
  'LLM_NO_DISPONIBLE',
  'LLM_RESPUESTA_INVALIDA',
]);

function _esErrorDeFormulario(error: ApiError): boolean {
  return error.status === 422 && error.detalles !== null;
}

function _debeNotificar(error: ApiError, req: HttpRequest<unknown>): boolean {
  return (
    !req.context.get(OMITIR_NOTIFICACION) &&
    !_esErrorDeFormulario(error) &&
    !CODIGOS_EN_PANTALLA.has(error.codigo as CodigoError)
  );
}

/** Convierte `HttpErrorResponse` en `ApiError`, aplica las reacciones globales y lo relanza. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);

  return next(req).pipe(
    catchError((respuesta: unknown) => {
      const error = mapearError(respuesta);
      _reaccionar(error, req, injector);
      return throwError(() => error);
    }),
  );
};

function _reaccionar(error: ApiError, req: HttpRequest<unknown>, injector: Injector): void {
  const silenciosa = req.context.get(OMITIR_NOTIFICACION);
  const router = injector.get(Router);
  const notificaciones = injector.get(NotificacionService);

  switch (error.codigo as CodigoError) {
    case 'SESION_INVALIDA':
      if (!silenciosa) {
        injector.get(SesionService).limpiar();
        void router.navigate(['/login']);
      }
      break;
    case 'CUENTA_DESACTIVADA':
      injector.get(SesionService).limpiar();
      void router.navigate(['/login']);
      break;
    case 'AUTORIZACION_PENDIENTE':
      void router.navigate(['/pendiente-autorizacion']);
      break;
    case 'POLITICA_DESACTUALIZADA':
      // Sin sesión (registro, acudiente) la propia pantalla recarga la política.
      if (injector.get(SesionService).autenticado()) {
        void router.navigate(['/aceptar-politica'], { queryParams: { volver: router.url } });
      }
      break;
    case 'FUNCION_PREMIUM':
      injector.get(CapacidadesService).refrescar();
      break;
    case 'ORIGEN_NO_PERMITIDO':
      console.error('[TutorIA][seguridad] Origen no permitido', req.method, req.url);
      notificaciones.error(MENSAJE_ORIGEN_NO_PERMITIDO);
      return;
  }

  if (_debeNotificar(error, req)) {
    notificaciones.error(error.mensaje);
  }
}
