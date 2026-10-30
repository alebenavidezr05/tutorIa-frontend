/** Acepta solo rutas internas (`/plan/1`), nunca `//otro.sitio` ni `https://…` (open redirect). */
export function rutaInternaSegura(valor: string | null | undefined, porDefecto: string): string {
  if (!valor || !valor.startsWith('/') || valor.startsWith('//') || valor.includes('\\')) {
    return porDefecto;
  }
  return valor;
}
