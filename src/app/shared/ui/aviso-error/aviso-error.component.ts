import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvisoPagina } from '../../utils/aviso-error';
import { BloqueoPremiumComponent } from '../bloqueo-premium/bloqueo-premium.component';
import { BotonComponent } from '../boton/boton.component';
import { IconoComponent } from '../icono/icono.component';

@Component({
  selector: 'app-aviso-error',
  imports: [RouterLink, BloqueoPremiumComponent, BotonComponent, IconoComponent],
  template: `
    @switch (aviso().tipo) {
      @case ('premium') {
        <app-bloqueo-premium [descripcion]="aviso().mensaje" />
      }
      @case ('limite') {
        <div class="alerta alerta--aviso" role="status">
          <app-icono class="alerta__icono" nombre="info" />
          <div class="alerta__cuerpo">
            <p>{{ aviso().mensaje }}</p>
            <a class="enlace-boton" routerLink="/planes">Ver planes</a>
          </div>
        </div>
      }
      @case ('compra') {
        <div class="alerta alerta--aviso" role="status">
          <app-icono class="alerta__icono" nombre="candado" />
          <p class="alerta__cuerpo">{{ aviso().mensaje }}</p>
        </div>
      }
      @case ('reintentar') {
        <div class="alerta alerta--error" role="alert">
          <app-icono class="alerta__icono" nombre="alerta" />
          <div class="alerta__cuerpo">
            <p>{{ aviso().mensaje }}</p>
            <button app-boton type="button" variante="secundario" (click)="reintentar.emit()">
              Reintentar
            </button>
          </div>
        </div>
      }
    }
  `,
  styles: `
    :host {
      display: block;
      margin-block: var(--espacio-4);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvisoErrorComponent {
  readonly aviso = input.required<AvisoPagina>();
  readonly reintentar = output<void>();
}
