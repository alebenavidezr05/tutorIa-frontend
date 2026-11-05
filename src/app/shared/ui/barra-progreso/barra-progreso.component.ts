import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Barra con etiqueta de texto obligatoria: el coral nunca es el único indicador. */
@Component({
  selector: 'app-barra-progreso',
  template: `
    @if (!etiquetaOculta()) {
      <p class="barra__etiqueta" [id]="idEtiqueta()">{{ etiqueta() }}</p>
    }
    <div
      class="barra"
      role="progressbar"
      [attr.aria-valuemin]="0"
      [attr.aria-valuemax]="max()"
      [attr.aria-valuenow]="valor()"
      [attr.aria-valuetext]="etiqueta()"
      [attr.aria-labelledby]="etiquetaOculta() ? null : idEtiqueta()"
      [attr.aria-label]="etiquetaOculta() ? etiqueta() : null"
    >
      <div class="barra__relleno"></div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .barra__etiqueta {
      margin: 0 0 var(--espacio-1);
      font-weight: 700;
      font-size: var(--texto-sm);
    }

    .barra {
      height: 10px;
      border: 1px solid var(--color-borde-control);
      border-radius: var(--radio-pildora);
      background: var(--color-fondo-alterno);
      overflow: hidden;
    }

    .barra__relleno {
      height: 100%;
      width: calc(var(--progreso, 0) * 1%);
      border-radius: inherit;
      background: var(--color-acento);
      transition: width var(--duracion-transicion) ease-out;
    }
  `,
  host: { '[style.--progreso]': 'porcentaje()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarraProgresoComponent {
  readonly valor = input.required<number>();
  readonly max = input(100);
  readonly etiqueta = input.required<string>();
  readonly etiquetaOculta = input(false);
  readonly idBase = input('progreso');

  protected readonly idEtiqueta = computed(() => `${this.idBase()}-etiqueta`);
  protected readonly porcentaje = computed(() => {
    const max = this.max();
    return max > 0 ? Math.min(100, Math.max(0, (this.valor() / max) * 100)) : 0;
  });
}
