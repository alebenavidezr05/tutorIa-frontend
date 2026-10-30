import { ValidatorFn } from '@angular/forms';
import { _longitudNormalizada, _textoDe, normalizarParaComparar } from './texto.validator';

export const LONGITUD_MIN_TEMA = 3;
export const LONGITUD_MAX_TEMA = 200;

/** Espejo de `PATRONES_RESOLVER_TAREA` del backend (solo formato: la regla de fondo es del backend). */
const _PATRONES_RESOLVER_TAREA: readonly RegExp[] = [
  /\bresuelve\w*/,
  /\bresolver (el|la|los|las|este|esta|mi)\b/,
  /\bhaz(me)? (la|mi|el|mis) (tarea|taller|ejercicio|examen|trabajo)/,
  /\bdame (las|la) respuestas?\b/,
  /\b(las|la) respuestas? (del|de la|de mi) (examen|taller|tarea|quiz)/,
  /\bhazme el (ensayo|trabajo|informe)/,
];

function _pideResolverTarea(texto: string): boolean {
  const normalizado = normalizarParaComparar(texto);
  return _PATRONES_RESOLVER_TAREA.some((patron) => patron.test(normalizado));
}

/** Tema de estudio: 3–200 caracteres y que no pida resolver una tarea. */
export function temaValidator(): ValidatorFn {
  return (control) => {
    const texto = _textoDe(control);
    if (texto.trim() === '') {
      return null;
    }
    return (
      _longitudNormalizada(texto, LONGITUD_MIN_TEMA, LONGITUD_MAX_TEMA, 'temaLongitud') ??
      (_pideResolverTarea(texto) ? { resolverTarea: true } : null)
    );
  };
}
