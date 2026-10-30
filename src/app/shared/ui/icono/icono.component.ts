import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type NombreIcono =
  | 'alerta'
  | 'info'
  | 'check'
  | 'candado'
  | 'cerrar'
  | 'menu'
  | 'adjuntar'
  | 'enviar'
  | 'play'
  | 'externo'
  | 'ia'
  | 'mas'
  | 'copiar'
  | 'descargar';

/** Trazos de 24×24 dibujados para la app (no son de la marca). */
const TRAZOS: Record<NombreIcono, string> = {
  alerta: 'M12 3 2 21h20L12 3Zm0 6v5m0 3v.5',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 7v6m0-9v.5',
  check: 'M4 12.5 9.5 18 20 6.5',
  candado: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  cerrar: 'M6 6l12 12M18 6 6 18',
  menu: 'M4 7h16M4 12h16M4 17h16',
  adjuntar: 'M16.5 7.5 9 15a2.1 2.1 0 0 0 3 3l7.5-7.5a4.2 4.2 0 0 0-6-6L6 12a6.4 6.4 0 0 0 9 9l5-5',
  enviar: 'M4 12 20 4l-6 16-3-7-7-1Z',
  play: 'M8 5v14l11-7L8 5Z',
  externo: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  ia: 'M12 3v3m0 12v3M3 12h3m12 0h3M7 7l2 2m6 6 2 2M7 17l2-2m6-6 2-2M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  mas: 'M5 12h.5M12 12h.5M19 12h.5',
  copiar: 'M9 9h11v11H9zM5 15H4V4h11v1',
  descargar: 'M12 4v11m-5-5 5 5 5-5M5 20h14',
};

/** Icono decorativo: siempre acompaña a un texto, nunca comunica solo. */
@Component({
  selector: 'app-icono',
  template: `<svg
    viewBox="0 0 24 24"
    [attr.width]="tamano()"
    [attr.height]="tamano()"
    aria-hidden="true"
    focusable="false"
  >
    <path [attr.d]="trazo()" />
  </svg>`,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      line-height: 0;
    }

    path {
      fill: none;
      stroke: currentcolor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconoComponent {
  readonly nombre = input.required<NombreIcono>();
  readonly tamano = input(20);
  protected readonly trazo = computed(() => TRAZOS[this.nombre()]);
}
