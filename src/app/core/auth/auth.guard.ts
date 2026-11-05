import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UsuarioPublico } from '../models';
import { SesionService } from './sesion.service';

/*
 * Guards de EXPERIENCIA, no de seguridad: quien protege los datos es el backend. Si la cookie
 * desaparece, cualquier llamada protegida devuelve 401 y el interceptor lleva a /login.
 */

export const RUTA_INICIO = '/tema';
export const RUTA_PENDIENTE = '/pendiente-autorizacion';
export const RUTA_VERIFICAR = '/verifica-tu-correo';

/** A dónde va una cuenta completa (correo confirmado y cuenta ACTIVA). */
export function destinoPostRegistro(): string {
  return RUTA_INICIO;
}

/**
 * ÚNICO punto que decide el siguiente paso según lo que dice el backend: primero confirmar el
 * correo; luego, si la cuenta no está ACTIVA (menor sin autorización), esperar al adulto
 * responsable; si no, el destino de siempre.
 */
export function siguientePaso(usuario: UsuarioPublico): string {
  if (usuario.correo_verificado === false) {
    return RUTA_VERIFICAR;
  }
  if (usuario.estado_cuenta !== 'ACTIVA') {
    return RUTA_PENDIENTE;
  }
  return destinoPostRegistro();
}

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
  return usuario ? router.parseUrl(siguientePaso(usuario)) : true;
};

/** Requiere correo confirmado y cuenta ACTIVA; si no, lleva al paso que falta. */
export const cuentaActivaGuard: CanActivateFn = async () => {
  const sesion = inject(SesionService);
  const router = inject(Router);
  const usuario = await sesion.asegurarRestaurada();
  const paso = usuario ? siguientePaso(usuario) : '/login';
  return paso === destinoPostRegistro() ? true : router.parseUrl(paso);
};

/**
 * Pantallas de espera (confirmar correo, autorización): solo se ven si ese es el paso que falta.
 * Una cuenta completa, o en otro paso, va directo a donde le corresponde. Va después de
 * `autenticadoGuard`.
 */
export function enPasoGuard(ruta: string): CanActivateFn {
  return async () => {
    const sesion = inject(SesionService);
    const router = inject(Router);
    const usuario = await sesion.asegurarRestaurada();
    const paso = usuario ? siguientePaso(usuario) : '/login';
    return paso === ruta ? true : router.parseUrl(paso);
  };
}
