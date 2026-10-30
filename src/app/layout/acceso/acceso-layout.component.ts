import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LogoComponent } from '../../shared/ui/logo/logo.component';
import { LEMA, LEMA_SECUNDARIO, TEXTOS_SHELL } from '../textos-layout';

/** Pantallas de acceso: panel marino con logo invertido y lema; formulario sobre crema. */
@Component({
  selector: 'app-acceso-layout',
  imports: [RouterOutlet, RouterLink, LogoComponent],
  template: `
    <aside class="panel" aria-label="TutorIA">
      <div class="panel__interior">
        <app-logo variante="invertido" [altura]="44" [sinMargen]="true" />
        <p class="panel__lema">{{ lema }}</p>
        <p class="panel__lema-secundario">{{ lemaSecundario }}</p>
      </div>
    </aside>
    <main id="contenido" class="formulario" tabindex="-1">
      <div class="formulario__interior">
        <router-outlet />
      </div>
      <ul class="formulario__pie">
        <li>
          <a routerLink="/politica">{{ textos.pie.politica }}</a>
        </li>
        <li>
          <a routerLink="/legal/cumplimiento">{{ textos.pie.cumplimiento }}</a>
        </li>
      </ul>
    </main>
  `,
  styleUrl: './acceso-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccesoLayoutComponent {
  protected readonly lema = LEMA;
  protected readonly lemaSecundario = LEMA_SECUNDARIO;
  protected readonly textos = TEXTOS_SHELL;
}
