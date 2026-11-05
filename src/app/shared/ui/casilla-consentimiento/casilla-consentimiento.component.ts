import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IconoComponent } from '../icono/icono.component';
import { estadoControl } from '../campo-formulario/estado-control';

/**
 * Casilla de autorización (Ley 1581). Nunca viene premarcada: el valor inicial lo pone el
 * formulario en `false`. El texto legal llega del backend.
 */
@Component({
  selector: 'app-casilla-consentimiento',
  imports: [ReactiveFormsModule, IconoComponent],
  template: `
    <div class="casilla" [class.casilla--error]="estado.mensajeError()">
      <input
        type="checkbox"
        class="casilla-nativa"
        [id]="idCasilla()"
        [formControl]="control()"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-invalid]="estado.mensajeError() ? 'true' : null"
        [attr.aria-required]="obligatoria() ? 'true' : null"
      />
      <label class="casilla__texto" [for]="idCasilla()">
        {{ texto() }}
        <span class="casilla__marca">{{ obligatoria() ? '(obligatoria)' : '(opcional)' }}</span>
      </label>
    </div>
    <div class="casilla__detalle" [id]="idDetalle()">
      <ng-content />
    </div>
    @if (estado.mensajeError(); as mensaje) {
      <p class="mensaje-error" [id]="idError()">
        <app-icono nombre="alerta" [tamano]="18" />
        <span>{{ mensaje }}</span>
      </p>
    }
  `,
  styles: `
    /* El contenedor puede compactarla con --casilla-* (por ejemplo, el registro en escritorio). */
    :host {
      display: block;
      margin-bottom: var(--casilla-separacion, var(--espacio-4));
      font-size: var(--casilla-texto, inherit);
      line-height: var(--casilla-interlineado, inherit);
    }

    input {
      margin-block: var(--casilla-margen, 10px);
    }

    .casilla {
      display: flex;
      align-items: flex-start;
      gap: var(--espacio-1);
      padding: var(--casilla-borde-relleno, var(--espacio-1));
      border-radius: var(--radio-md);
      border: 2px solid transparent;
    }

    .casilla--error {
      border-color: var(--color-error);
    }

    .casilla__texto {
      padding-block: var(--casilla-relleno, 10px);
      cursor: pointer;
    }

    .casilla__marca {
      font-weight: 700;
      color: var(--color-texto-suave);
      white-space: nowrap;
    }

    .casilla__detalle {
      padding-left: 48px;
      font-size: var(--casilla-texto, var(--texto-sm));
      color: var(--color-texto-suave);
    }

    .casilla__detalle:empty {
      display: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CasillaConsentimientoComponent {
  readonly control = input.required<FormControl<boolean>>();
  readonly idCasilla = input.required<string>();
  readonly texto = input.required<string>();
  readonly obligatoria = input(false);

  readonly estado = estadoControl(this.control);
  protected readonly idDetalle = computed(() => `${this.idCasilla()}-detalle`);
  protected readonly idError = computed(() => `${this.idCasilla()}-error`);
  protected readonly describedBy = computed(() =>
    [this.idDetalle(), this.estado.mensajeError() ? this.idError() : null]
      .filter((id): id is string => id !== null)
      .join(' '),
  );
}
