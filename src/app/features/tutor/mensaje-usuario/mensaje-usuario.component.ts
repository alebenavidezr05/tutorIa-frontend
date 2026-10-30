import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TamanoArchivoPipe } from '../../../shared/pipes/tamano-archivo.pipe';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { MensajeChat } from '../mensaje-chat';
import { TEXTOS_CHAT } from '../tutor.textos';

@Component({
  selector: 'app-mensaje-usuario',
  imports: [IconoComponent, TamanoArchivoPipe],
  template: `
    <p class="visualmente-oculto">{{ textos.tu }}:</p>
    <div class="burbuja" [class.burbuja--local]="mensaje().local">
      <p class="burbuja__texto">{{ mensaje().contenido }}</p>
      @if (mensaje().archivo; as archivo) {
        @if (esImagen() && urlArchivo()) {
          <img
            class="burbuja__imagen"
            [src]="urlArchivo()"
            [alt]="textoArchivo()"
            loading="lazy"
            width="320"
            height="240"
          />
        } @else {
          <p class="burbuja__archivo">
            <app-icono nombre="adjuntar" [tamano]="16" />
            <span>{{ textoArchivo() }} ({{ archivo.tamano_bytes | tamanoArchivo }})</span>
          </p>
        }
      }
    </div>
  `,
  styles: `
    @use 'mixins' as *;

    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .burbuja {
      max-width: 100%;
      padding: var(--espacio-3) var(--espacio-4);
      border-radius: var(--radio-lg) var(--radio-lg) var(--radio-sm) var(--radio-lg);
      background: var(--color-burbuja-usuario);
      color: var(--color-sobre-burbuja-usuario);

      @include desde(md) {
        max-width: 75%;
      }
    }

    .burbuja--local {
      opacity: 0.85;
    }

    .burbuja__texto {
      margin: 0;
      white-space: pre-line;
      overflow-wrap: anywhere;
    }

    .burbuja__imagen {
      display: block;
      width: 100%;
      max-width: 320px;
      height: auto;
      margin-top: var(--espacio-2);
      border-radius: var(--radio-md);
    }

    .burbuja__archivo {
      display: flex;
      gap: var(--espacio-1);
      align-items: center;
      margin: var(--espacio-2) 0 0;
      font-size: var(--texto-sm);
      overflow-wrap: anywhere;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MensajeUsuarioComponent {
  readonly mensaje = input.required<MensajeChat>();
  /** URL del contenido servida por la API (la calcula el contenedor). */
  readonly urlArchivo = input<string | null>(null);

  protected readonly textos = TEXTOS_CHAT;
  protected readonly esImagen = computed(
    () => this.mensaje().archivo?.mime.startsWith('image/') ?? false,
  );
  protected readonly textoArchivo = computed(() =>
    this.textos.archivoAdjunto(this.mensaje().archivo?.nombre ?? ''),
  );
}
