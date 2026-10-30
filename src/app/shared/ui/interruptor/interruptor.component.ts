import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

let contador = 0;

/** Interruptor accesible (`role="switch"`) con estado en texto: "Activado" / "Desactivado". */
@Component({
  selector: 'app-interruptor',
  template: `
    <div class="interruptor">
      <div class="interruptor__textos">
        <span class="interruptor__etiqueta" [id]="idEtiqueta">{{ etiqueta() }}</span>
        @if (descripcion(); as texto) {
          <span class="interruptor__descripcion" [id]="idDescripcion">{{ texto }}</span>
        }
      </div>
      <button
        type="button"
        role="switch"
        class="interruptor__boton"
        [attr.aria-checked]="activo()"
        [attr.aria-labelledby]="idEtiqueta"
        [attr.aria-describedby]="descripcion() ? idDescripcion : null"
        [disabled]="deshabilitado()"
        (click)="cambiar.emit(!activo())"
      >
        <span class="interruptor__pista" aria-hidden="true"><span></span></span>
        <span class="interruptor__estado">{{ activo() ? 'Activado' : 'Desactivado' }}</span>
      </button>
    </div>
  `,
  styleUrl: './interruptor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InterruptorComponent {
  readonly activo = input.required<boolean>();
  readonly etiqueta = input.required<string>();
  readonly descripcion = input<string | null>(null);
  readonly deshabilitado = input(false);
  readonly cambiar = output<boolean>();

  private readonly id = ++contador;
  protected readonly idEtiqueta = `interruptor-${this.id}`;
  protected readonly idDescripcion = `interruptor-${this.id}-descripcion`;
}
