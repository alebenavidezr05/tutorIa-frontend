import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { LogoComponent } from '../../shared/ui/logo/logo.component';
import { VexComponent } from '../../shared/ui/vex/vex.component';
import { TEXTOS_ACOMPANAMIENTO, TEXTOS_PORTADA, TEXTOS_SHELL } from '../textos-layout';

type VistaPanel = 'portada' | 'registro' | 'otra';

/**
 * Pantallas de acceso: panel de marca + formulario. En escritorio van en dos columnas y caben sin
 * desplazarse. En `/login` (la portada) y `/registro` el panel explica qué es TutorIA, presenta a
 * Vex y muestra cómo funciona; en las demás solo acompaña.
 */
@Component({
  selector: 'app-acceso-layout',
  imports: [RouterOutlet, RouterLink, LogoComponent, VexComponent],
  template: `
    <div class="acceso" [class.acceso--registro]="vista() === 'registro'">
      <aside class="panel" [class.panel--portada]="vista() === 'portada'" aria-label="TutorIA">
        <app-logo class="panel__logo" variante="horizontal" [altura]="64" [sinMargen]="true" />
        @if (vista() === 'otra') {
          <div class="acompana">
            <app-vex estado="acompanando" tamano="sm" />
            <p class="acompana__texto">{{ acompanamiento }}</p>
          </div>
        } @else {
          <div class="intro">
            <p class="intro__que-es">{{ portada.queEs }}</p>
            <div class="intro__vex">
              <app-vex
                estado="saludo"
                tamano="sm"
                [decorativo]="true"
                [prioritaria]="vista() === 'portada'"
                [flotante]="true"
              />
              <p class="intro__burbuja">{{ portada.vex }}</p>
            </div>
            <p id="acceso-pasos" class="intro__subtitulo">{{ portada.comoFuncionaTitulo }}</p>
            <ol class="lista-limpia pasos" aria-labelledby="acceso-pasos">
              @for (paso of portada.pasos; track paso.texto; let i = $index) {
                <li class="pasos__item">
                  <span class="pasos__numero" aria-hidden="true">{{ i + 1 }}</span>
                  <span>{{ paso.texto }}</span>
                </li>
              }
            </ol>
          </div>
        }
      </aside>
      <main id="contenido" class="formulario" tabindex="-1">
        <div
          class="formulario__interior"
          [class.formulario__interior--ancho]="vista() === 'registro'"
        >
          <router-outlet />
        </div>
      </main>
      <ul class="pie">
        <li>
          <a routerLink="/politica">{{ textos.pie.politica }}</a>
        </li>
        <li>
          <a routerLink="/legal/cumplimiento">{{ textos.pie.cumplimiento }}</a>
        </li>
      </ul>
    </div>
  `,
  styleUrl: './acceso-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccesoLayoutComponent {
  private readonly router = inject(Router);

  protected readonly textos = TEXTOS_SHELL;
  protected readonly portada = TEXTOS_PORTADA;
  protected readonly acompanamiento = TEXTOS_ACOMPANAMIENTO;

  /** Solo decide qué contenido decorativo lleva el panel; no afecta la navegación. */
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((evento) => evento instanceof NavigationEnd),
      map((evento) => evento.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly vista = computed<VistaPanel>(() => {
    const ruta = this.url().split(/[?#]/)[0];
    if (ruta === '/login') {
      return 'portada';
    }
    return ruta === '/registro' ? 'registro' : 'otra';
  });
}
