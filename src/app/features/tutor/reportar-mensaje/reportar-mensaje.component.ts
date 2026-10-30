import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CategoriaReporte, ReporteEntrada } from '../../../core/models';
import { DialogoConfirmacionComponent } from '../../../shared/ui/dialogo-confirmacion/dialogo-confirmacion.component';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { LONGITUD_MAX_COMENTARIO_REPORTE, normalizarTexto } from '../../../shared/validators';
import { CATEGORIAS_REPORTE, TEXTOS_REPORTE } from '../tutor.textos';

let contador = 0;

@Component({
  selector: 'app-reportar-mensaje',
  imports: [DialogoConfirmacionComponent, IconoComponent],
  template: `
    @if (reportado()) {
      <p class="reportar__hecho" role="status">
        <app-icono nombre="check" [tamano]="16" /> {{ textos.reportado }}
      </p>
    } @else {
      <button type="button" class="reportar__boton" (click)="abierto.set(true)">
        <app-icono nombre="alerta" [tamano]="16" /> {{ textos.boton }}
      </button>
    }

    <app-dialogo-confirmacion
      [abierto]="abierto()"
      [titulo]="textos.titulo"
      [textoConfirmar]="textos.enviar"
      variante="peligro"
      (confirmar)="enviar()"
      (cancelar)="abierto.set(false)"
    >
      <label class="reportar__etiqueta" [for]="idCategoria">{{ textos.categoria }}</label>
      <select class="control" [id]="idCategoria" (change)="elegirCategoria($event)">
        @for (c of categorias; track c.valor) {
          <option [value]="c.valor" [selected]="c.valor === categoria()">{{ c.etiqueta }}</option>
        }
      </select>
      <label class="reportar__etiqueta" [for]="idComentario">{{ textos.comentario }}</label>
      <textarea
        class="control"
        rows="3"
        [id]="idComentario"
        [maxLength]="maximo"
        [value]="comentario()"
        (input)="escribirComentario($event)"
      ></textarea>
    </app-dialogo-confirmacion>
  `,
  styles: `
    .reportar__boton {
      display: inline-flex;
      align-items: center;
      gap: var(--espacio-1);
      min-height: var(--objetivo-tactil);
      padding: var(--espacio-1) var(--espacio-3);
      border: 1px solid var(--color-borde-control);
      border-radius: var(--radio-pildora);
      background: transparent;
      color: var(--color-texto);
      font-size: var(--texto-sm);
      font-weight: 700;
      cursor: pointer;
    }

    .reportar__hecho {
      display: inline-flex;
      align-items: center;
      gap: var(--espacio-1);
      margin: 0;
      font-size: var(--texto-sm);
      color: var(--color-exito);
    }

    .reportar__etiqueta {
      display: block;
      margin: var(--espacio-3) 0 var(--espacio-1);
      font-weight: 700;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportarMensajeComponent {
  readonly reportado = input(false);
  readonly reportar = output<ReporteEntrada>();

  private readonly id = ++contador;
  protected readonly idCategoria = `reporte-${this.id}-categoria`;
  protected readonly idComentario = `reporte-${this.id}-comentario`;
  protected readonly textos = TEXTOS_REPORTE;
  protected readonly categorias = CATEGORIAS_REPORTE;
  protected readonly maximo = LONGITUD_MAX_COMENTARIO_REPORTE;
  protected readonly abierto = signal(false);
  protected readonly categoria = signal<CategoriaReporte>('CONTENIDO_INCORRECTO');
  protected readonly comentario = signal('');

  protected elegirCategoria(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;
    this.categoria.set(CATEGORIAS_REPORTE.find((c) => c.valor === valor)?.valor ?? 'OTRO');
  }

  protected escribirComentario(evento: Event): void {
    this.comentario.set((evento.target as HTMLTextAreaElement).value);
  }

  protected enviar(): void {
    const comentario = normalizarTexto(this.comentario());
    this.reportar.emit(
      comentario ? { categoria: this.categoria(), comentario } : { categoria: this.categoria() },
    );
    this.abierto.set(false);
  }
}
