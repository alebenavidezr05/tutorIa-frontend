import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Espejo de `normalizar_texto` del backend: recorta y colapsa espacios. */
export function normalizarTexto(valor: string): string {
  return valor.replace(/\s+/g, ' ').trim();
}

/** Espejo de `normalizar_para_comparar`: sin tildes y en minúscula. */
export function normalizarParaComparar(valor: string): string {
  return normalizarTexto(valor).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function _textoDe(control: AbstractControl): string {
  const valor: unknown = control.value;
  return typeof valor === 'string' ? valor : '';
}

export function _longitudNormalizada(
  texto: string,
  min: number,
  max: number,
  clave: string,
): ValidationErrors | null {
  const longitud = normalizarTexto(texto).length;
  return longitud < min || longitud > max ? { [clave]: { min, max, actual: longitud } } : null;
}

/** Longitud tras normalizar espacios. Vacío se deja a `Validators.required`. */
export function longitudTextoValidator(min: number, max: number): ValidatorFn {
  return (control) => {
    const texto = _textoDe(control);
    return texto === '' ? null : _longitudNormalizada(texto, min, max, 'longitudTexto');
  };
}
