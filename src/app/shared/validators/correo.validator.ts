import { ValidationErrors, ValidatorFn } from '@angular/forms';
import { _textoDe } from './texto.validator';

export const LONGITUD_MAX_CORREO = 254;
const _PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Espejo de `normalizar_correo`. */
export function normalizarCorreo(correo: string): string {
  return correo.trim().toLowerCase();
}

function _formato(correo: string): ValidationErrors | null {
  return _PATRON_CORREO.test(correo) ? null : { correo: true };
}

function _longitud(correo: string): ValidationErrors | null {
  return correo.length > LONGITUD_MAX_CORREO ? { correo: true } : null;
}

export function correoValidator(): ValidatorFn {
  return (control) => {
    const correo = normalizarCorreo(_textoDe(control));
    return correo === '' ? null : (_longitud(correo) ?? _formato(correo));
  };
}

/**
 * Validador de grupo: los dos correos deben ser distintos. Marca el error en el segundo campo
 * para que se muestre junto a él.
 */
export function correosDistintosValidator(campoA: string, campoB: string): ValidatorFn {
  return (grupo) => {
    const a = grupo.get(campoA);
    const b = grupo.get(campoB);
    if (!a || !b) {
      return null;
    }
    const iguales =
      normalizarCorreo(_textoDe(a)) !== '' &&
      normalizarCorreo(_textoDe(a)) === normalizarCorreo(_textoDe(b));
    const { correosIguales: _previo, ...resto } = b.errors ?? {};
    if (iguales) {
      b.setErrors({ ...resto, correosIguales: true });
    } else if (b.hasError('correosIguales')) {
      b.setErrors(Object.keys(resto).length > 0 ? resto : null);
    }
    return iguales ? { correosIguales: true } : null;
  };
}
