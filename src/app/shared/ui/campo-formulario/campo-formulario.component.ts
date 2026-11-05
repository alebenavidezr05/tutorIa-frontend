import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { IconoComponent } from '../icono/icono.component';
import { estadoControl } from './estado-control';

/**
 * Etiqueta visible arriba, control proyectado (clase global `.control`), y ayuda y error debajo. El control proyectado lleva la directiva
 * `appControlCampo`, que le asigna `id`, `aria-describedby`, `aria-invalid` y `aria-required`.
 */
@Component({
  selector: 'app-campo-formulario',
  imports: [IconoComponent],
  template: `
    <label class="campo__etiqueta" [for]="idCampo()">
      {{ etiqueta() }}
      @if (opcional()) {
        <span class="campo__opcional">(opcional)</span>
      }
    </label>
    <ng-content />
    @if (ayuda(); as textoAyuda) {
      <p class="campo__ayuda" [id]="idAyuda()">{{ textoAyuda }}</p>
    }
    @if (estado.mensajeError(); as mensaje) {
      <p class="mensaje-error" [id]="idError()">
        <app-icono nombre="alerta" [tamano]="18" />
        <span>{{ mensaje }}</span>
      </p>
    }
  `,
  styles: `
    :host {
      display: block;
      margin-bottom: var(--espacio-campos);
    }

    .campo__etiqueta {
      display: block;
      font-weight: 700;
      line-height: 1.35;
      margin-bottom: 6px;
    }

    .campo__opcional {
      font-weight: 400;
      color: var(--color-texto-suave);
    }

    .campo__ayuda {
      margin: var(--espacio-1) 0 0;
      font-size: var(--texto-xs);
      line-height: 1.4;
      color: var(--color-texto-suave);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampoFormularioComponent {
  readonly etiqueta = input.required<string>();
  readonly idCampo = input.required<string>();
  readonly control = input.required<AbstractControl>();
  readonly ayuda = input<string | null>(null);
  readonly opcional = input(false);

  readonly estado = estadoControl(this.control);
  readonly idAyuda = computed(() => `${this.idCampo()}-ayuda`);
  readonly idError = computed(() => `${this.idCampo()}-error`);
  readonly describedBy = computed(() => {
    const ids = [
      this.ayuda() ? this.idAyuda() : null,
      this.estado.mensajeError() ? this.idError() : null,
    ];
    return ids.filter((id): id is string => id !== null).join(' ') || null;
  });
}
