import { Directive, inject } from '@angular/core';
import { CampoFormularioComponent } from './campo-formulario.component';

/** Asocia el control nativo con su etiqueta, ayuda y error de `app-campo-formulario`. */
@Directive({
  selector: '[appControlCampo]',
  host: {
    '[id]': 'campo.idCampo()',
    '[attr.aria-describedby]': 'campo.describedBy()',
    '[attr.aria-invalid]': 'campo.estado.mensajeError() ? "true" : null',
    '[attr.aria-required]': 'campo.estado.obligatorio() ? "true" : null',
  },
})
export class ControlCampoDirective {
  protected readonly campo = inject(CampoFormularioComponent);
}
