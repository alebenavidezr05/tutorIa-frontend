import { AbstractControl, FormGroup } from '@angular/forms';
import { ApiError } from '../../core/models';

/** `fecha_nacimiento` → `fechaNacimiento` */
export function snakeACamel(nombre: string): string {
  return nombre.replace(/_([a-z0-9])/g, (_coincidencia, letra: string) => letra.toUpperCase());
}

function _buscarControl(form: FormGroup, campo: string): AbstractControl | null {
  // El backend puede enviar rutas como "body.fecha_nacimiento": se usa el último segmento.
  const ultimo = campo.split('.').pop() ?? campo;
  return form.get(ultimo) ?? form.get(snakeACamel(ultimo));
}

/**
 * Asigna cada `detalles[i]` del error del servidor al control con el mismo nombre mediante el
 * error `{ servidor: mensaje }`. Devuelve `true` si se asignó al menos uno.
 */
export function aplicarErroresServidor(form: FormGroup, error: ApiError): boolean {
  let aplicados = 0;
  for (const detalle of error.detalles ?? []) {
    const control = _buscarControl(form, detalle.campo);
    if (control) {
      control.setErrors({ ...(control.errors ?? {}), servidor: detalle.mensaje });
      control.markAsTouched();
      aplicados++;
    }
  }
  return aplicados > 0;
}

/** Marca con el mensaje del servidor los controles indicados (p. ej., casillas obligatorias). */
export function marcarControles(controles: readonly AbstractControl[], mensaje: string): void {
  for (const control of controles) {
    control.setErrors({ ...(control.errors ?? {}), servidor: mensaje });
    control.markAsTouched();
  }
}
