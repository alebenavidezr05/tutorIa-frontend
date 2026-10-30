import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionService } from './sesion.service';

/*
 * Guards de EXPERIENCIA, no de seguridad: quien protege los datos es el backend. Si la cookie
 * desaparece, cualquier llamada protegida devuelve 401 y el interceptor lleva a /login.
 */

export const RUTA_INICIO = '/tema';
export const RUTA_PENDIENTE = '/pendiente-autorizacion';

/** Requiere sesión. */
export const autenticadoGuard: CanActivateFn = async (_ruta, estado) => {
  const sesion = inject(SesionService);
  const router = inject(Router);
  const usuario = await sesion.asegurarRestaurada();
  return usuario ? true : router.createUrlTree(['/login'], { queryParams: { volver: estado.url } });
};

/** Solo para quien no ha iniciado sesión (login y registro). */
export const invitadoGuard: CanActivateFn = async () => {
  const sesion = inject(SesionService);
  const router = inject(Router);
  const usuario = await sesion.asegurarRestaurada();
  if (!usuario) {
    return true;
  }
  return router.parseUrl(usuario.estado_cuenta === 'ACTIVA' ? RUTA_INICIO : RUTA_PENDIENTE);
};

/** Requiere que la cuenta esté ACTIVA; si no, lleva a la pantalla de autorización pendiente. */
export const cuentaActivaGuard: CanActivateFn = async () => {
  const sesion = inject(SesionService);
  const router = inject(Router);
  const usuario = await sesion.asegurarRestaurada();
  return usuario?.estado_cuenta === 'ACTIVA' ? true : router.parseUrl(RUTA_PENDIENTE);
};
