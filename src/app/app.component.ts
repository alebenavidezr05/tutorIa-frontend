import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  Injector,
  afterNextRender,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, skip } from 'rxjs';
import { NotificacionService } from './core/notificaciones/notificacion.service';
import { ToastComponent } from './shared/ui/toast/toast.component';

export const ID_CONTENIDO = 'contenido';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  template: `
    <a class="saltar" href="#contenido" (click)="saltarAlContenido($event)">
      Saltar al contenido principal
    </a>
    <router-outlet />
    <app-toast [notificaciones]="notificaciones.cola()" (cerrar)="notificaciones.cerrar($event)" />
  `,
  styles: `
    .saltar {
      position: fixed;
      z-index: 100;
      top: var(--espacio-2);
      left: var(--espacio-2);
      padding: var(--espacio-2) var(--espacio-4);
      border-radius: var(--radio-md);
      background: var(--color-primario);
      color: var(--color-sobre-primario);
      font-weight: 700;
      transform: translateY(-200%);
    }

    .saltar:focus {
      transform: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected readonly notificaciones = inject(NotificacionService);
  private readonly documento = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  constructor() {
    // Foco gestionado al cambiar de ruta: el lector de pantalla anuncia la nueva página.
    inject(Router)
      .events.pipe(
        filter((evento) => evento instanceof NavigationEnd),
        skip(1),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => afterNextRender(() => this.enfocarContenido(), { injector: this.injector }));
  }

  protected saltarAlContenido(evento: Event): void {
    evento.preventDefault();
    this.enfocarContenido();
  }

  private enfocarContenido(): void {
    const contenido = this.documento.getElementById(ID_CONTENIDO);
    const titulo = contenido?.querySelector<HTMLElement>('h1');
    if (titulo) {
      titulo.tabIndex = -1;
      titulo.focus({ preventScroll: true });
    } else {
      contenido?.focus({ preventScroll: true });
    }
  }
}
