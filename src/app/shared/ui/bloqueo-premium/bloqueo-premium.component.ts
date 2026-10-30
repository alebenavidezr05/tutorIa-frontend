import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BotonComponent } from '../boton/boton.component';
import { IconoComponent } from '../icono/icono.component';
import { TEXTO_PREMIUM } from '../textos-ui';

/**
 * Explica por qué una función está bloqueada y lleva a /planes. No decide nada: lo bloqueado lo
 * determina el backend (`capacidades`, `FUNCION_PREMIUM`).
 */
@Component({
  selector: 'app-bloqueo-premium',
  imports: [RouterLink, BotonComponent, IconoComponent],
  template: `
    <div class="bloqueo__cabecera">
      <span class="bloqueo__candado"><app-icono nombre="candado" /></span>
      <div>
        <p class="bloqueo__titulo">{{ titulo() }}</p>
        @if (descripcion(); as texto) {
          <p class="bloqueo__descripcion">{{ texto }}</p>
        }
      </div>
    </div>
    @if (!compacto()) {
      <p class="bloqueo__incluye-titulo">Premium incluye:</p>
      <ul class="bloqueo__lista">
        @for (item of incluye(); track item) {
          <li><app-icono nombre="check" [tamano]="18" /> {{ item }}</li>
        }
      </ul>
    }
    <a app-boton variante="acento" routerLink="/planes">{{ textoBoton() }}</a>
  `,
  styles: `
    :host {
      display: block;
      padding: var(--espacio-4);
      border: 2px solid var(--color-acento);
      border-radius: var(--radio-lg);
      background: var(--color-superficie);
    }

    .bloqueo__cabecera {
      display: flex;
      gap: var(--espacio-3);
      align-items: flex-start;
      margin-bottom: var(--espacio-3);
    }

    .bloqueo__candado {
      display: inline-flex;
      padding: var(--espacio-2);
      border-radius: var(--radio-md);
      background: var(--color-acento);
      color: var(--color-sobre-acento);
    }

    .bloqueo__titulo {
      margin: 0;
      font-weight: 800;
    }

    .bloqueo__descripcion {
      margin: var(--espacio-1) 0 0;
      color: var(--color-texto-suave);
    }

    .bloqueo__incluye-titulo {
      margin-bottom: var(--espacio-1);
      font-weight: 700;
    }

    .bloqueo__lista {
      list-style: none;
      padding: 0;

      li {
        display: flex;
        gap: var(--espacio-2);
        align-items: flex-start;
        margin-bottom: var(--espacio-1);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BloqueoPremiumComponent {
  readonly titulo = input<string>(TEXTO_PREMIUM.titulo);
  readonly descripcion = input<string | null>(null);
  readonly incluye = input<readonly string[]>(TEXTO_PREMIUM.incluye);
  readonly textoBoton = input<string>(TEXTO_PREMIUM.boton);
  readonly compacto = input(false);
}
