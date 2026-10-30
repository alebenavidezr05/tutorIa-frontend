import { environment } from '../../../environments/environment';

function _origen(base: string): string {
  return /^https?:\/\//.test(base) ? new URL(base).origin : '';
}

/**
 * Convierte una ruta servida por la propia API (p. ej. `/api/v1/visuales/123/imagen`) en una URL
 * utilizable en `<img src>`: le antepone el origen de `apiBaseUrl`. Rechaza (`null`) cualquier URL
 * de terceros para que el navegador nunca contacte proveedores externos.
 */
export function resolverUrlApi(
  ruta: string,
  apiBaseUrl: string = environment.apiBaseUrl,
): string | null {
  const origen = _origen(apiBaseUrl);
  if (ruta.startsWith('/') && !ruta.startsWith('//')) {
    return `${origen}${ruta}`;
  }
  if (origen && /^https:\/\//.test(ruta) && new URL(ruta).origin === origen) {
    return ruta;
  }
  return null;
}
