import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MisDatos } from '../../../core/models';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { TEXTOS_PRIVACIDAD } from '../privacidad.textos';
import { resumirMisDatos } from '../resumir-mis-datos';

@Component({
  selector: 'app-seccion-mis-datos',
  imports: [BotonComponent, IconoComponent],
  template: `
    <h2 id="privacidad-mis-datos">{{ textos.titulo }}</h2>
    @if (resumen(); as r) {
      <div class="grupos">
        <section>
          <h3>{{ textos.cuenta }}</h3>
          <dl>
            @for (fila of r.cuenta; track fila.etiqueta) {
              <dt>{{ fila.etiqueta }}</dt>
              <dd>{{ fila.valor }}</dd>
            }
          </dl>
        </section>
        @if (r.perfil.length > 0) {
          <section>
            <h3>{{ textos.perfil }}</h3>
            <dl>
              @for (fila of r.perfil; track fila.etiqueta) {
                <dt>{{ fila.etiqueta }}</dt>
                <dd>{{ fila.valor }}</dd>
              }
            </dl>
          </section>
        }
        <section>
          <h3>{{ textos.contenido }}</h3>
          <dl>
            @for (fila of r.contenido; track fila.etiqueta) {
              <dt>{{ fila.etiqueta }}</dt>
              <dd>{{ fila.valor }}</dd>
            }
          </dl>
        </section>
      </div>
    } @else if (error()) {
      <p class="mensaje-error"><app-icono nombre="alerta" [tamano]="18" /> {{ textos.error }}</p>
    }
    <button
      app-boton
      type="button"
      variante="secundario"
      [cargando]="descargando()"
      [disabled]="descargando()"
      (click)="descargar.emit()"
    >
      <app-icono nombre="descargar" /> {{ textos.descargar }}
    </button>
  `,
  styles: `
    @use 'mixins' as *;

    .grupos {
      display: grid;
      gap: var(--espacio-4);
      grid-template-columns: minmax(0, 1fr);

      @include desde(md) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    h3 {
      font-size: var(--texto-md);
    }

    dt {
      font-weight: 700;
    }

    dd {
      margin: 0 0 var(--espacio-2);
      overflow-wrap: anywhere;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeccionMisDatosComponent {
  readonly misDatos = input<MisDatos | null>(null);
  readonly error = input(false);
  readonly descargando = input(false);
  readonly descargar = output<void>();

  protected readonly textos = TEXTOS_PRIVACIDAD.misDatos;
  protected readonly resumen = computed(() => {
    const datos = this.misDatos();
    return datos ? resumirMisDatos(datos) : null;
  });
}
