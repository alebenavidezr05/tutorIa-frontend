import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { SelectorArchivoComponent } from '../../../shared/ui/selector-archivo/selector-archivo.component';
import { LONGITUD_MAX_MENSAJE, mensajeEnviable } from '../../../shared/validators';
import { TEXTOS_CAMPO } from '../tutor.textos';

/**
 * Campo del mensaje. Enter envía y Shift+Enter hace salto de línea. Mientras se espera respuesta
 * queda en solo lectura (no `disabled`) para que el foco no se pierda.
 */
@Component({
  selector: 'app-campo-mensaje',
  imports: [IconoComponent, SelectorArchivoComponent],
  templateUrl: './campo-mensaje.component.html',
  styleUrl: './campo-mensaje.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampoMensajeComponent {
  readonly texto = model('');
  readonly esperando = input(false);
  readonly aceptaArchivos = input(false);
  readonly sinCupoArchivos = input(false);
  readonly adjunto = input<File | null>(null);
  readonly progresoAdjunto = input<number | null>(null);
  readonly errorAdjunto = input<string | null>(null);
  /** Error de `MENSAJE_NO_PERMITIDO`: se muestra junto al campo y se conserva el texto. */
  readonly errorMensaje = input<string | null>(null);
  readonly contexto = input<string | null>(null);
  readonly enviar = output<void>();
  readonly adjuntar = output<File>();
  readonly quitarAdjunto = output<void>();
  readonly quitarContexto = output<void>();

  private readonly campo = viewChild.required<ElementRef<HTMLTextAreaElement>>('campo');

  protected readonly textos = TEXTOS_CAMPO;
  protected readonly maximo = LONGITUD_MAX_MENSAJE;
  protected readonly contador = computed(() =>
    this.textos.contador(this.texto().length, this.maximo),
  );
  protected readonly cercaDelLimite = computed(() => this.texto().length > this.maximo - 100);
  protected readonly puedeEnviar = computed(
    () => !this.esperando() && mensajeEnviable(this.texto()),
  );
  protected readonly describedBy = computed(() =>
    [
      'campo-mensaje-ayuda',
      'campo-mensaje-contador',
      this.errorMensaje() ? 'campo-mensaje-error' : null,
    ]
      .filter((id): id is string => id !== null)
      .join(' '),
  );

  enfocar(): void {
    this.campo().nativeElement.focus();
  }

  protected alEscribir(evento: Event): void {
    this.texto.set((evento.target as HTMLTextAreaElement).value);
  }

  protected alPulsarTecla(evento: KeyboardEvent): void {
    if (evento.key !== 'Enter' || evento.shiftKey || evento.isComposing) {
      return;
    }
    evento.preventDefault();
    this.intentarEnviar();
  }

  protected intentarEnviar(): void {
    if (this.puedeEnviar()) {
      this.enviar.emit();
    }
  }
}
