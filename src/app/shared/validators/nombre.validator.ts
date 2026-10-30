import { ValidatorFn } from '@angular/forms';
import { _longitudNormalizada, _textoDe } from './texto.validator';

export const LONGITUD_MIN_NOMBRE = 2;
export const LONGITUD_MAX_NOMBRE = 100;

/** Espejo de `validar_nombre`: 2–100 caracteres tras normalizar espacios. */
export function nombreValidator(): ValidatorFn {
  return (control) => {
    const nombre = _textoDe(control);
    return nombre.trim() === ''
      ? null
      : _longitudNormalizada(nombre, LONGITUD_MIN_NOMBRE, LONGITUD_MAX_NOMBRE, 'nombreLongitud');
  };
}
