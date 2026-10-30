import { ValidatorFn } from '@angular/forms';

/** Constantes que reflejan `archivo_max_bytes` y `archivo_mimes_permitidos` del backend. */
export const TAMANO_MAXIMO_ARCHIVO = 5_242_880;
export const TIPOS_ARCHIVO_PERMITIDOS: readonly string[] = [
  'text/plain',
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
];
/** Valor del atributo `accept` del `<input type="file">`. */
export const ACCEPT_ARCHIVO =
  '.txt,.pdf,.png,.jpg,.jpeg,.webp,' + TIPOS_ARCHIVO_PERMITIDOS.join(',');

const _EXTENSIONES: Record<string, string> = {
  txt: 'text/plain',
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

export type ErrorArchivo = 'archivoVacio' | 'archivoTipo' | 'archivoTamano';

/** Algunos navegadores no informan el tipo: se deduce de la extensión solo como ayuda. */
export function tipoDeArchivo(archivo: Pick<File, 'type' | 'name'>): string {
  if (archivo.type) {
    return archivo.type;
  }
  const extension = archivo.name.split('.').pop()?.toLowerCase() ?? '';
  return _EXTENSIONES[extension] ?? '';
}

function _vacio(archivo: Pick<File, 'size'>): ErrorArchivo | null {
  return archivo.size === 0 ? 'archivoVacio' : null;
}

function _tamano(archivo: Pick<File, 'size'>): ErrorArchivo | null {
  return archivo.size > TAMANO_MAXIMO_ARCHIVO ? 'archivoTamano' : null;
}

function _tipo(archivo: Pick<File, 'type' | 'name'>): ErrorArchivo | null {
  return TIPOS_ARCHIVO_PERMITIDOS.includes(tipoDeArchivo(archivo)) ? null : 'archivoTipo';
}

/**
 * Comprobación de ayuda (tipo y tamaño). La validación real, por contenido, la hace el backend.
 */
export function validarArchivo(archivo: Pick<File, 'type' | 'name' | 'size'>): ErrorArchivo | null {
  return _vacio(archivo) ?? _tamano(archivo) ?? _tipo(archivo);
}

export function esImagen(archivo: Pick<File, 'type' | 'name'>): boolean {
  return tipoDeArchivo(archivo).startsWith('image/');
}

/** Para un `FormControl<File | null>`. */
export function archivoValidator(): ValidatorFn {
  return (control) => {
    const valor: unknown = control.value;
    if (!(valor instanceof File)) {
      return null;
    }
    const error = validarArchivo(valor);
    return error ? { [error]: true } : null;
  };
}
