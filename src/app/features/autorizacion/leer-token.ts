/** Lee `token` de un fragmento `token=…` (sin `#`). Devuelve `null` si falta o no es plausible. */
export function leerTokenDeFragmento(fragmento: string | null | undefined): string | null {
  if (!fragmento) {
    return null;
  }
  const token = new URLSearchParams(fragmento.replace(/^#/, '')).get('token')?.trim() ?? '';
  return /^[A-Za-z0-9._~-]{20,100}$/.test(token) ? token : null;
}
