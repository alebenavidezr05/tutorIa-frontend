import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BotonComponent } from '../../shared/ui/boton/boton.component';
import { VexComponent } from '../../shared/ui/vex/vex.component';

@Component({
  selector: 'app-no-encontrado',
  imports: [RouterLink, VexComponent, BotonComponent],
  template: `
    <main id="contenido" class="no-encontrado" tabindex="-1">
      <app-vex estado="acompanando" tamano="md" />
      <h1>No encontramos esta página</h1>
      <p>Puede que el enlace esté mal escrito o que la página ya no exista.</p>
      <a app-boton variante="primario" routerLink="/tema">Ir al inicio</a>
    </main>
  `,
  styles: `
    .no-encontrado {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100dvh;
      padding: var(--espacio-6) var(--espacio-4);
      text-align: center;
    }

    .no-encontrado:focus {
      outline: none;
    }

    p {
      max-width: 40ch;
      color: var(--color-texto-suave);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoEncontradoComponent {}
