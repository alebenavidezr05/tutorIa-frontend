import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { BotonComponent } from '../../shared/ui/boton/boton.component';
import { LogoComponent } from '../../shared/ui/logo/logo.component';
import { VexComponent } from '../../shared/ui/vex/vex.component';
import {
  TEXTOS_ACOMPANAMIENTO,
  TEXTOS_BENEFICIOS,
  TEXTOS_PORTADA,
  TEXTOS_SHELL,
} from '../textos-layout';

type VistaPanel = 'portada' | 'registro' | 'otra';

/**
 * Pantallas de acceso: panel suave de marca + formulario. En `/login` (la entrada de quien aún no
 * tiene sesión) el panel hace de portada; en `/registro` muestra los beneficios.
 */
@Component({
  selector: 'app-acceso-layout',
  imports: [RouterOutlet, RouterLink, LogoComponent, BotonComponent, VexComponent],
  template: `
    <aside class="panel" [class.panel--portada]="vista() === 'portada'" aria-label="TutorIA">
      <div class="panel__interior">
        <app-logo class="panel__logo" variante="horizontal" [altura]="32" [sinMargen]="true" />
        @switch (vista()) {
          @case ('portada') {
            <div class="heroe">
              <app-vex
                class="heroe__vex"
                estado="saludo"
                tamano="xl"
                [prioritaria]="true"
                [flotante]="true"
              />
              <div class="heroe__texto">
                <p class="heroe__saludo">{{ portada.saludo }}</p>
                <p class="heroe__que-es">{{ portada.queEs }}</p>
                <p id="portada-pasos" class="heroe__subtitulo">
                  {{ portada.comoFuncionaTitulo }}
                </p>
                <ol class="lista-limpia pasos" aria-labelledby="portada-pasos">
                  @for (paso of portada.pasos; track paso; let i = $index) {
                    <li class="pasos__item">
                      <span class="pasos__numero" aria-hidden="true">{{ i + 1 }}</span>
                      <span>{{ paso }}</span>
                    </li>
                  }
                </ol>
                <a app-boton variante="acento" routerLink="/registro">{{ portada.crearCuenta }}</a>
              </div>
            </div>
          }
          @case ('registro') {
            <div class="lateral">
              <app-vex estado="saludo" tamano="sm" />
              <p class="lateral__titulo">{{ beneficios.titulo }}</p>
              <ul class="lista-limpia beneficios">
                @for (beneficio of beneficios.beneficios; track beneficio) {
                  <li class="beneficios__item">{{ beneficio }}</li>
                }
              </ul>
            </div>
          }
          @default {
            <div class="lateral">
              <app-vex estado="acompanando" tamano="sm" />
              <p class="lateral__titulo">{{ acompanamiento }}</p>
            </div>
          }
        }
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
  private readonly router = inject(Router);

  protected readonly textos = TEXTOS_SHELL;
  protected readonly portada = TEXTOS_PORTADA;
  protected readonly beneficios = TEXTOS_BENEFICIOS;
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
