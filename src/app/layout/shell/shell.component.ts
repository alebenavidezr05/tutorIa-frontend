import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { CapacidadesService } from '../../core/auth/capacidades.service';
import { SesionService } from '../../core/auth/sesion.service';
import { NotificacionService } from '../../core/notificaciones/notificacion.service';
import { IconoComponent } from '../../shared/ui/icono/icono.component';
import { LogoComponent } from '../../shared/ui/logo/logo.component';
import { ENLACES_NAVEGACION, LEMA, TEXTOS_SHELL } from '../textos-layout';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LogoComponent, IconoComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  host: { '(document:keydown.escape)': 'cerrarMenuConEscape()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  protected readonly sesion = inject(SesionService);
  private readonly capacidades = inject(CapacidadesService);
  private readonly notificaciones = inject(NotificacionService);
  private readonly router = inject(Router);

  protected readonly enlaces = ENLACES_NAVEGACION;
  protected readonly textos = TEXTOS_SHELL;
  protected readonly lema = LEMA;
  protected readonly menuAbierto = signal(false);
  protected readonly cerrando = signal(false);
  private readonly botonMenu = viewChild<ElementRef<HTMLButtonElement>>('botonMenu');

  constructor() {
    // Las capacidades del plan se cargan al entrar con una cuenta activa.
    effect(() => {
      if (this.sesion.cuentaActiva() && !this.capacidades.cargada()) {
        untracked(() => this.capacidades.refrescar());
      }
    });
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => this.menuAbierto.set(false));
  }

  protected alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  /** Escape cierra el menú móvil y devuelve el foco a su botón. */
  protected cerrarMenuConEscape(): void {
    if (this.menuAbierto()) {
      this.menuAbierto.set(false);
      this.botonMenu()?.nativeElement.focus();
    }
  }

  protected cerrarSesion(): void {
    this.cerrando.set(true);
    this.sesion.cerrar().subscribe({
      complete: () => this.salir(),
      error: () => this.salir(),
    });
  }

  private salir(): void {
    this.cerrando.set(false);
    this.notificaciones.info(this.textos.sesionCerrada);
    void this.router.navigate(['/login']);
  }
}
