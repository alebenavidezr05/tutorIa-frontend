import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type VarianteLogo = 'horizontal' | 'invertido' | 'icono';

/**
 * Activos recortados de docs/brand/identidad-visual.png (sin redibujar). Sustitúyelos por los SVG
 * vectoriales oficiales cuando existan (ver README).
 */
export const RUTAS_LOGO = {
  horizontal: 'assets/brand/logo-horizontal.png',
  invertido: 'assets/brand/logo-horizontal-invertido.png',
  icono: 'assets/brand/icono-app.png',
} as const;

/** Proporción ancho/alto de cada activo, para reservar espacio y no deformar. */
const PROPORCION: Record<VarianteLogo, number> = {
  horizontal: 841 / 221,
  invertido: 608 / 164,
  icono: 1,
};

/** Margen de respeto: la hoja coral mide ≈ 55 % de la altura del logo. */
const MARGEN_RESPETO = 0.55;

@Component({
  selector: 'app-logo',
  template: `
    @switch (variante()) {
      @case ('horizontal') {
        <!-- En modo oscuro se usa automáticamente la versión invertida. -->
        <picture>
          <source [attr.srcset]="rutas.invertido" media="(prefers-color-scheme: dark)" />
          <img [src]="rutas.horizontal" alt="TutorIA" [width]="ancho()" [height]="altura()" />
        </picture>
      }
      @case ('invertido') {
        <img [src]="rutas.invertido" alt="TutorIA" [width]="ancho()" [height]="altura()" />
      }
      @case ('icono') {
        <img [src]="rutas.icono" alt="TutorIA" [width]="altura()" [height]="altura()" />
      }
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      line-height: 0;
    }

    /* El alto lo puede fijar el contenedor con --logo-alto; el ancho sigue la proporción. */
    img {
      display: block;
      max-width: none;
      width: auto;
      height: var(--logo-alto, auto);
    }
  `,
  host: { '[style.padding.px]': 'margen()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoComponent {
  readonly variante = input<VarianteLogo>('horizontal');
  readonly altura = input(32);
  /** Desactiva el margen de respeto cuando el contenedor ya lo garantiza. */
  readonly sinMargen = input(false);

  protected readonly rutas = RUTAS_LOGO;
  protected readonly ancho = computed(() =>
    Math.round(this.altura() * PROPORCION[this.variante()]),
  );
  protected readonly margen = computed(() =>
    this.sinMargen() ? 0 : Math.round(this.altura() * MARGEN_RESPETO),
  );
}
