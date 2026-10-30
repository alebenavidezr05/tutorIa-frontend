import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Notificacion } from '../../../core/notificaciones/notificacion.service';
import { IconoComponent, NombreIcono } from '../icono/icono.component';

const ICONOS: Record<Notificacion['tipo'], NombreIcono> = {
  exito: 'check',
  info: 'info',
  error: 'alerta',
};

const PREFIJOS: Record<Notificacion['tipo'], string> = {
  exito: 'Listo:',
  info: 'Aviso:',
  error: 'Error:',
};

@Component({
  selector: 'app-toast-item',
  imports: [IconoComponent],
  template: `
    <app-icono [nombre]="icono()" />
    <p class="toast__texto">
      <span class="visualmente-oculto">{{ prefijo() }}</span>
      {{ notificacion().mensaje }}
    </p>
    <button type="button" class="toast__cerrar" (click)="cerrar.emit()">
      <app-icono nombre="cerrar" [tamano]="18" />
      <span class="visualmente-oculto">Cerrar mensaje</span>
    </button>
  `,
  styleUrl: './toast.component.scss',
  host: { class: 'toast', '[class]': "'toast--' + notificacion().tipo" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastItemComponent {
  readonly notificacion = input.required<Notificacion>();
  readonly cerrar = output<void>();
  protected readonly icono = computed(() => ICONOS[this.notificacion().tipo]);
  protected readonly prefijo = computed(() => PREFIJOS[this.notificacion().tipo]);
}

/**
 * Las regiones vivas existen siempre (aunque estén vacías) para que los lectores de pantalla
 * anuncien lo que se agrega: `polite` para avisos, `assertive` para errores.
 */
@Component({
  selector: 'app-toast',
  imports: [ToastItemComponent],
  template: `
    <div class="toasts">
      <div role="status" aria-live="polite">
        @for (n of informativas(); track n.id) {
          <app-toast-item [notificacion]="n" (cerrar)="cerrar.emit(n.id)" />
        }
      </div>
      <div role="alert" aria-live="assertive">
        @for (n of errores(); track n.id) {
          <app-toast-item [notificacion]="n" (cerrar)="cerrar.emit(n.id)" />
        }
      </div>
    </div>
  `,
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  readonly notificaciones = input.required<readonly Notificacion[]>();
  readonly cerrar = output<number>();

  protected readonly informativas = computed(() =>
    this.notificaciones().filter((n) => n.tipo !== 'error'),
  );
  protected readonly errores = computed(() =>
    this.notificaciones().filter((n) => n.tipo === 'error'),
  );
}
