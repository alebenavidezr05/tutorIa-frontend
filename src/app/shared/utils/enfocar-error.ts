/** Lleva el foco al primer campo inválido del formulario (tras pintar los errores). */
export function enfocarPrimerError(contenedor: HTMLElement): void {
  setTimeout(() => contenedor.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
}
