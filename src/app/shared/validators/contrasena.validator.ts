import { ValidationErrors, ValidatorFn } from '@angular/forms';
import { _textoDe } from './texto.validator';

export const LONGITUD_MIN_CONTRASENA = 8;
export const LONGITUD_MAX_CONTRASENA = 64;
/** bcrypt ignora lo que pase de 72 bytes: el backend lo rechaza. */
export const MAX_BYTES_CONTRASENA = 72;

function _longitud(contrasena: string): ValidationErrors | null {
  const fuera =
    contrasena.length < LONGITUD_MIN_CONTRASENA || contrasena.length > LONGITUD_MAX_CONTRASENA;
  return fuera
    ? { contrasenaLongitud: { min: LONGITUD_MIN_CONTRASENA, max: LONGITUD_MAX_CONTRASENA } }
    : null;
}

function _bytes(contrasena: string): ValidationErrors | null {
  return new TextEncoder().encode(contrasena).length > MAX_BYTES_CONTRASENA
    ? { contrasenaBytes: true }
    : null;
}

function _composicion(contrasena: string): ValidationErrors | null {
  return /\p{L}/u.test(contrasena) && /\d/.test(contrasena)
    ? null
    : { contrasenaComposicion: true };
}

/** Espejo de `validar_contrasena`: 8–64 caracteres, al menos una letra y un número. */
export function contrasenaValidator(): ValidatorFn {
  return (control) => {
    const contrasena = _textoDe(control);
    if (contrasena === '') {
      return null;
    }
    return _longitud(contrasena) ?? _bytes(contrasena) ?? _composicion(contrasena);
  };
}
