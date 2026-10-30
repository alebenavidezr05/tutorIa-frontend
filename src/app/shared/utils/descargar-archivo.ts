/** Entrega un `Blob` al usuario como archivo descargable, sin guardarlo en el navegador. */
export function descargarBlob(blob: Blob, nombre: string, documento: Document = document): void {
  const url = URL.createObjectURL(blob);
  const enlace = documento.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.rel = 'noopener';
  documento.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** `mis-datos-2026-10-18.json` */
export function nombreConFecha(prefijo: string, extension: string, hoy: Date = new Date()): string {
  const fecha = [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, '0'),
    String(hoy.getDate()).padStart(2, '0'),
  ].join('-');
  return `${prefijo}-${fecha}.${extension}`;
}
