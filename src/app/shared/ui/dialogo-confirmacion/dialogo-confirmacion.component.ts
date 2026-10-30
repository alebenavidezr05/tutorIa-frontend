import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { BotonComponent, VarianteBoton } from '../boton/boton.component';

let contador = 0;

/**
 * Diálogo modal con `<dialog>` nativo: `showModal()` vuelve inerte el resto de la página (foco
 * atrapado) y Escape cancela. Al cerrar, el foco vuelve al elemento que lo abrió.
 */
@Component({
  selector: 'app-dialogo-confirmacion',
  imports: [BotonComponent],
  template: `
    <dialog
      #dialogo
      class="dialogo"
      [attr.aria-labelledby]="idTitulo"
      [attr.aria-describedby]="idCuerpo"
      (cancel)="alCancelar($event)"
    >
      <h2 class="dialogo__titulo" [id]="idTitulo">{{ titulo() }}</h2>
      <div class="dialogo__cuerpo" [id]="idCuerpo">
        <ng-content />
      </div>
      <div class="dialogo__acciones">
        <button app-boton type="button" variante="secundario" (click)="cancelar.emit()">
          {{ textoCancelar() }}
        </button>
        <button
          app-boton
          type="button"
          [variante]="variante()"
          [cargando]="cargando()"
          [disabled]="cargando() || confirmarDeshabilitado()"
          (click)="confirmar.emit()"
        >
          {{ textoConfirmar() }}
        </button>
      </div>
    </dialog>
  `,
  styleUrl: './dialogo-confirmacion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogoConfirmacionComponent {
  readonly abierto = input.required<boolean>();
  readonly titulo = input.required<string>();
  readonly textoConfirmar = input('Confirmar');
  readonly textoCancelar = input('Cancelar');
  readonly variante = input<VarianteBoton>('primario');
  readonly cargando = input(false);
  readonly confirmarDeshabilitado = input(false);
  readonly confirmar = output<void>();
  readonly cancelar = output<void>();

  private readonly documento = inject(DOCUMENT);
  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');
  private readonly id = ++contador;
  private disparador: HTMLElement | null = null;

  protected readonly idTitulo = `dialogo-${this.id}-titulo`;
  protected readonly idCuerpo = `dialogo-${this.id}-cuerpo`;

  constructor() {
    effect(() => this.sincronizar(this.abierto()));
  }

  protected alCancelar(evento: Event): void {
    evento.preventDefault();
    this.cancelar.emit();
  }

  private sincronizar(abierto: boolean): void {
    const dialogo = this.dialogo().nativeElement;
    if (abierto && !dialogo.open) {
      const activo = this.documento.activeElement;
      this.disparador = activo instanceof HTMLElement ? activo : null;
      dialogo.showModal();
    } else if (!abierto && dialogo.open) {
      dialogo.close();
      this.disparador?.focus();
      this.disparador = null;
    }
  }
}
