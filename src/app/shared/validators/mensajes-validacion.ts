import { ValidationErrors } from '@angular/forms';
import { TAMANO_MAXIMO_ARCHIVO } from './archivo.validator';

type Constructor = (valor: unknown) => string;

function _limites(valor: unknown): { min: number; max: number } {
  const v = (typeof valor === 'object' && valor !== null ? valor : {}) as Partial<
    Record<'min' | 'max' | 'requiredLength', number>
  >;
  return { min: v.min ?? v.requiredLength ?? 0, max: v.max ?? v.requiredLength ?? 0 };
}

const _MB = Math.round(TAMANO_MAXIMO_ARCHIVO / 1024 / 1024);

/** Mapa centralizado de mensajes de validación (§8). */
export const MENSAJES_VALIDACION: Record<string, Constructor> = {
  servidor: (valor) => (typeof valor === 'string' ? valor : 'Revisa este dato.'),
  required: () => 'Este campo es obligatorio.',
  requiredTrue: () => 'Debes marcar esta casilla para continuar.',
  email: () => 'Escribe un correo válido, por ejemplo nombre@correo.com.',
  correo: () => 'Escribe un correo válido, por ejemplo nombre@correo.com.',
  correosIguales: () => 'El correo del estudiante debe ser distinto al del adulto responsable.',
  minlength: (v) => `Escribe al menos ${_limites(v).min} caracteres.`,
  maxlength: (v) => `Escribe máximo ${_limites(v).max} caracteres.`,
  longitudTexto: (v) => `Escribe entre ${_limites(v).min} y ${_limites(v).max} caracteres.`,
  nombreLongitud: (v) =>
    `El nombre debe tener entre ${_limites(v).min} y ${_limites(v).max} caracteres.`,
  temaLongitud: (v) =>
    `El tema debe tener entre ${_limites(v).min} y ${_limites(v).max} caracteres.`,
  resolverTarea: () =>
    'TutorIA te enseña, no te hace la tarea. Escribe el tema que quieres aprender, por ejemplo "fracciones equivalentes".',
  contrasenaLongitud: (v) =>
    `La contraseña debe tener entre ${_limites(v).min} y ${_limites(v).max} caracteres.`,
  contrasenaBytes: () => 'La contraseña es demasiado larga.',
  contrasenaComposicion: () => 'La contraseña debe tener al menos una letra y un número.',
  nivelEducativo: () => 'Elige un nivel educativo de la lista.',
  fechaInvalida: () => 'Escribe una fecha válida.',
  fechaFutura: () => 'La fecha de nacimiento no puede estar en el futuro.',
  edadMinima: (v) => `TutorIA está disponible a partir de los ${_limites(v).min} años.`,
  edadMaxima: () => 'Revisa la fecha de nacimiento.',
  archivoVacio: () => 'El archivo está vacío.',
  archivoTipo: () => 'Usa un archivo de texto (.txt), PDF, PNG, JPEG o WebP.',
  archivoTamano: () => `El archivo pesa más de ${_MB} MB.`,
};

/** Devuelve el mensaje del primer error conocido (el del servidor tiene prioridad). */
export function mensajeDeError(errores: ValidationErrors | null): string | null {
  if (!errores) {
    return null;
  }
  const claves = Object.keys(errores);
  const clave = claves.includes('servidor')
    ? 'servidor'
    : claves.find((c) => c in MENSAJES_VALIDACION);
  const constructor = clave ? MENSAJES_VALIDACION[clave] : undefined;
  return constructor && clave ? constructor(errores[clave]) : 'Revisa este dato.';
}
