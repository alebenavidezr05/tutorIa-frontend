import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type VarianteBoton = 'primario' | 'acento' | 'secundario' | 'peligro' | 'texto';

/**
 * Botón del sistema de diseño. Se aplica sobre `<button>` o `<a>` nativos para conservar su
 * semántica: `<button app-boton variante="acento" type="submit">`.
 */
@Component({
  selector: 'button[app-boton], a[app-boton]',
  template: `
    @if (cargando()) {
      <span class="boton__indicador" aria-hidden="true"></span>
    }
    <span class="boton__texto"><ng-content /></span>
  `,
  styleUrl: './boton.component.scss',
  host: {
    class: 'boton',
    '[class]': "'boton--' + variante()",
    '[class.boton--bloque]': 'bloque()',
    '[class.boton--cargando]': 'cargando()',
    '[attr.aria-busy]': 'cargando() ? "true" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BotonComponent {
  readonly variante = input<VarianteBoton>('primario');
  readonly cargando = input(false);
  /** Ocupa todo el ancho disponible (útil en móvil). */
  readonly bloque = input(false);
}
