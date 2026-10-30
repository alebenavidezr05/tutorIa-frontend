import { ValidationErrors, ValidatorFn } from '@angular/forms';
import {
  FechaSimple,
  calcularEdad,
  compararFechas,
  fechaDeHoy,
  parsearFecha,
} from '../utils/calcular-edad';
import { _textoDe } from './texto.validator';

export const EDAD_MINIMA = 13;
export const EDAD_MAYORIA = 18;
export const EDAD_MAXIMA = 100;

export interface OpcionesFechaNacimiento {
  edadMinima?: number;
  edadMaxima?: number;
  /** Inyectable para pruebas. */
  hoy?: () => Date;
}

function _noFutura(fecha: FechaSimple, hoy: Date): ValidationErrors | null {
  return compararFechas(fecha, fechaDeHoy(hoy)) > 0 ? { fechaFutura: true } : null;
}

function _rangoEdad(edad: number, min: number, max: number): ValidationErrors | null {
  if (edad < min) {
    return { edadMinima: { min } };
  }
  return edad > max ? { edadMaxima: { max } } : null;
}

/** Espejo de `validar_fecha_nacimiento` + `validar_edad_minima`: no futura y edad ≥ 13. */
export function fechaNacimientoValidator(opciones: OpcionesFechaNacimiento = {}): ValidatorFn {
  const { edadMinima = EDAD_MINIMA, edadMaxima = EDAD_MAXIMA, hoy = () => new Date() } = opciones;
  return (control) => {
    const valor = _textoDe(control);
    if (valor === '') {
      return null;
    }
    const fecha = parsearFecha(valor);
    if (!fecha) {
      return { fechaInvalida: true };
    }
    const ahora = hoy();
    const edad = calcularEdad(valor, ahora) ?? 0;
    return _noFutura(fecha, ahora) ?? _rangoEdad(edad, edadMinima, edadMaxima);
  };
}

export function esMenorDeEdad(fechaNacimiento: string, hoy: Date = new Date()): boolean {
  const edad = calcularEdad(fechaNacimiento, hoy);
  return edad !== null && edad >= 0 && edad < EDAD_MAYORIA;
}
