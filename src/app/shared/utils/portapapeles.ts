/** Copia texto con `navigator.clipboard`. Resuelve `false` si el navegador no lo permite. */
export function copiarAlPortapapeles(
  texto: string,
  documento: Document = document,
): Promise<boolean> {
  const portapapeles = documento.defaultView?.navigator.clipboard;
  if (!portapapeles) {
    return Promise.resolve(false);
  }
  return portapapeles.writeText(texto).then(
    () => true,
    () => false,
  );
}
