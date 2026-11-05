import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';

export type EstadoVex =
  'saludo' | 'escuchando' | 'pensando' | 'explicando' | 'celebrando' | 'acompanando';

export type TamanoVex = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ImagenVex {
  readonly archivo: string;
  readonly ancho: number;
  readonly alto: number;
  readonly alt: string;
}

/**
 * ÚNICO lugar donde cada estado se asocia a su imagen (public/assets/vex/). Las imágenes se usan
 * tal cual: no se redibujan, convierten ni renombran. `ancho` y `alto` son los del PNG original.
 */
const IMAGENES_VEX: Record<EstadoVex, ImagenVex> = {
  saludo: {
    archivo: 'assets/vex/01_saludo.png',
    ancho: 204,
    alto: 202,
    alt: 'Vex, tu compañero de aprendizaje, saluda con la mano',
  },
  escuchando: {
    archivo: 'assets/vex/02_escuchando.png',
    ancho: 198,
    alto: 205,
    alt: 'Vex escucha con atención',
  },
  pensando: {
    archivo: 'assets/vex/03_pensando.png',
    ancho: 194,
    alto: 203,
    alt: 'Vex está pensando',
  },
  explicando: {
    archivo: 'assets/vex/04_explicando.png',
    ancho: 216,
    alto: 185,
    alt: 'Vex te explica una idea',
  },
  celebrando: {
    archivo: 'assets/vex/05_celebrando.png',
    ancho: 217,
    alto: 214,
    alt: 'Vex celebra tu avance',
  },
  acompanando: {
    archivo: 'assets/vex/06_acompanando.png',
    ancho: 181,
    alto: 195,
    alt: 'Vex te acompaña',
  },
};

/** Poses sin elementos extra: las únicas legibles en tamaño `xs`. */
const ESTADOS_XS: readonly EstadoVex[] = ['saludo', 'escuchando', 'acompanando'];

/**
 * Vex, la mascota de TutorIA. Componente solo presentacional: elige la imagen del estado y su
 * tamaño (tokens `--vex-*` de los estilos globales). Si la imagen no carga, muestra un respaldo
 * discreto: un círculo coral con la letra «V».
 */
@Component({
  selector: 'app-vex',
  template: `
    @if (fallo()) {
      <span class="vex__respaldo" role="img" [attr.aria-label]="decorativo() ? null : imagen().alt"
        ><span aria-hidden="true">V</span></span
      >
    } @else {
      <img
        class="vex__imagen"
        [src]="imagen().archivo"
        [alt]="decorativo() ? '' : imagen().alt"
        [width]="imagen().ancho"
        [height]="imagen().alto"
        [attr.loading]="prioritaria() ? 'eager' : 'lazy'"
        [attr.fetchpriority]="prioritaria() ? 'high' : null"
        decoding="async"
        (error)="fallo.set(true)"
      />
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      width: var(--vex-ancho);
      max-width: 100%;
      line-height: 0;
    }

    :host(.vex--xs) {
      --vex-ancho: var(--vex-xs);
    }

    :host(.vex--sm) {
      --vex-ancho: var(--vex-sm);
    }

    :host(.vex--md) {
      --vex-ancho: var(--vex-md);
    }

    :host(.vex--lg) {
      --vex-ancho: var(--vex-lg);
    }

    :host(.vex--xl) {
      --vex-ancho: var(--vex-xl);
    }

    .vex__imagen {
      display: block;
      width: 100%;
      max-width: 100%;
      height: auto;
      object-fit: contain;
      animation: vex-aparecer 320ms ease-out both;
    }

    :host(.vex--flotante) .vex__imagen {
      animation:
        vex-aparecer 320ms ease-out both,
        vex-flotar 4s ease-in-out 320ms infinite;
    }

    .vex__respaldo {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      aspect-ratio: 1;
      border-radius: 50%;
      background: var(--color-acento);
      color: var(--color-sobre-acento);
      font-weight: 800;
      font-size: calc(var(--vex-ancho) * 0.45);
      line-height: 1;
    }

    @keyframes vex-aparecer {
      from {
        opacity: 0;
      }
    }

    @keyframes vex-flotar {
      50% {
        transform: translateY(-6px);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .vex__imagen,
      :host(.vex--flotante) .vex__imagen {
        animation: none;
      }
    }
  `,
  host: {
    '[class]': "'vex--' + tamano()",
    '[class.vex--flotante]': 'flotante()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VexComponent {
  readonly estado = input<EstadoVex>('saludo');
  readonly tamano = input<TamanoVex>('md');
  /** Imagen principal de la portada: se carga de inmediato (sin `lazy`). */
  readonly prioritaria = input(false);
  /** Leve flotación (se desactiva con «reducir movimiento»). */
  readonly flotante = input(false);
  /** Cuando un texto vecino ya nombra a Vex, la imagen se oculta a lectores de pantalla. */
  readonly decorativo = input(false);

  /** En `xs` las poses con burbuja, bombilla o trofeo no se leen: se usa «acompañando». */
  private readonly estadoEfectivo = computed<EstadoVex>(() =>
    this.tamano() === 'xs' && !ESTADOS_XS.includes(this.estado()) ? 'acompanando' : this.estado(),
  );

  protected readonly imagen = computed(() => IMAGENES_VEX[this.estadoEfectivo()]);
  /** Se reinicia al cambiar de imagen. */
  protected readonly fallo = linkedSignal({ source: this.imagen, computation: () => false });
}
