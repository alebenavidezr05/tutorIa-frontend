import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { ImagenPublica } from '../../../core/models';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { TEXTO_ENLACE_EXTERNO } from '../../../shared/ui/textos-ui';
import { urlExternaSegura } from '../../../shared/utils/referencias';
import { resolverUrlApi } from '../../../shared/utils/resolver-url-api';
import { TEXTOS_VISUAL } from '../tutor.textos';

/**
 * Imagen real o ilustración IA servida por la propia API, con atribución obligatoria y siempre
 * visible. Si la imagen no carga, quedan el pie y la atribución.
 */
@Component({
  selector: 'app-imagen-tutor',
  imports: [IconoComponent],
  template: `
    <figure class="imagen">
      @if (esIa()) {
        <p class="imagen__ia"><app-icono nombre="ia" [tamano]="18" /> {{ textos.ilustracionIa }}</p>
      }
      @if (src() && !caida()) {
        <img
          class="imagen__img"
          [src]="src()"
          [alt]="imagen().texto_alternativo"
          loading="lazy"
          decoding="async"
          width="800"
          height="450"
          (error)="caida.set(true)"
        />
      }
      <figcaption class="imagen__pie">
        <span class="imagen__texto">{{ imagen().pie }}</span>
        <span class="imagen__atribucion">
          {{ textos.autor }}: {{ imagen().autor ?? textos.sinAutor }}
          @if (imagen().licencia) {
            · {{ textos.licencia }}:
            @if (urlLicencia(); as url) {
              <a [href]="url" target="_blank" rel="noopener noreferrer">
                {{ imagen().licencia }}<span class="visualmente-oculto"> {{ textoExterno }}</span>
              </a>
            } @else {
              {{ imagen().licencia }}
            }
          }
          @if (imagen().proveedor) {
            · {{ textos.proveedor }}: {{ imagen().proveedor }}
          }
          @if (urlOrigen(); as url) {
            ·
            <a [href]="url" target="_blank" rel="noopener noreferrer">
              {{ textos.origen }}<span class="visualmente-oculto"> {{ textoExterno }}</span>
            </a>
          }
        </span>
        @if (esIa() && avisoIa()) {
          <span class="imagen__aviso">{{ avisoIa() }}</span>
        }
      </figcaption>
    </figure>
  `,
  styles: `
    .imagen {
      margin: 0;
    }

    .imagen__img {
      display: block;
      width: 100%;
      height: auto;
      max-height: 70dvh;
      object-fit: contain;
      border-radius: var(--radio-md);
      background: var(--color-fondo-alterno);
    }

    .imagen__ia {
      display: inline-flex;
      align-items: center;
      gap: var(--espacio-1);
      margin-bottom: var(--espacio-2);
      padding: 0 var(--espacio-2);
      border: 2px solid var(--color-texto);
      border-radius: var(--radio-pildora);
      font-weight: 800;
      font-size: var(--texto-sm);
    }

    .imagen__pie {
      display: flex;
      flex-direction: column;
      gap: var(--espacio-1);
      margin-top: var(--espacio-2);
      font-size: var(--texto-sm);
    }

    .imagen__texto {
      font-weight: 600;
    }

    .imagen__atribucion,
    .imagen__aviso {
      color: var(--color-texto-suave);
      overflow-wrap: anywhere;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImagenTutorComponent {
  readonly imagen = input.required<ImagenPublica>();
  readonly esIa = input(false);
  readonly avisoIa = input<string | null>(null);

  protected readonly textos = TEXTOS_VISUAL;
  protected readonly textoExterno = TEXTO_ENLACE_EXTERNO;
  protected readonly caida = signal(false);
  /** Solo rutas de la propia API: el navegador nunca contacta al proveedor de la imagen. */
  protected readonly src = computed(() => resolverUrlApi(this.imagen().url));
  protected readonly urlLicencia = computed(() => urlExternaSegura(this.imagen().url_licencia));
  protected readonly urlOrigen = computed(() => urlExternaSegura(this.imagen().url_origen));
}
