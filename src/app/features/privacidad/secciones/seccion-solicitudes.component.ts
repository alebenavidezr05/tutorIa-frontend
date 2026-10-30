import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SolicitudEntrada, SolicitudPublica, TipoSolicitud } from '../../../core/models';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { CampoFormularioComponent } from '../../../shared/ui/campo-formulario/campo-formulario.component';
import { ControlCampoDirective } from '../../../shared/ui/campo-formulario/control-campo.directive';
import { enfocarPrimerError } from '../../../shared/utils/enfocar-error';
import {
  LONGITUD_MAX_DETALLE_SOLICITUD,
  LONGITUD_MIN_DETALLE_SOLICITUD,
  longitudTextoValidator,
  normalizarTexto,
} from '../../../shared/validators';
import {
  NOMBRE_ESTADO_SOLICITUD,
  NOMBRE_TIPO_SOLICITUD,
  TEXTOS_PRIVACIDAD,
  TIPOS_SOLICITUD,
} from '../privacidad.textos';

@Component({
  selector: 'app-seccion-solicitudes',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    BotonComponent,
    CampoFormularioComponent,
    ControlCampoDirective,
  ],
  template: `
    <h2 id="privacidad-solicitudes">{{ textos.titulo }}</h2>
    <p>{{ textos.texto }}</p>
    <form [formGroup]="form" (ngSubmit)="enviar()" novalidate>
      <app-campo-formulario
        [etiqueta]="textos.tipo"
        idCampo="solicitud-tipo"
        [control]="form.controls.tipo"
      >
        <select appControlCampo class="control" formControlName="tipo">
          @for (t of tipos; track t.valor) {
            <option [value]="t.valor">{{ t.etiqueta }}</option>
          }
        </select>
      </app-campo-formulario>
      <app-campo-formulario
        [etiqueta]="textos.detalle"
        idCampo="solicitud-detalle"
        [ayuda]="textos.ayudaDetalle"
        [control]="form.controls.detalle"
      >
        <textarea
          appControlCampo
          class="control"
          rows="4"
          [maxlength]="maximo"
          formControlName="detalle"
        ></textarea>
      </app-campo-formulario>
      <button
        app-boton
        type="submit"
        variante="primario"
        [cargando]="enviando()"
        [disabled]="enviando()"
      >
        {{ textos.enviar }}
      </button>
    </form>

    <h3>{{ textos.lista }}</h3>
    @if (solicitudes().length === 0) {
      <p class="texto-suave">{{ textos.vacio }}</p>
    } @else {
      <ul class="lista-limpia">
        @for (s of solicitudes(); track s.id_solicitud) {
          <li class="solicitud">
            <strong>{{ nombresTipo[s.tipo] }}</strong> · {{ nombresEstado[s.estado] }}
            <span class="texto-suave"
              >· {{ textos.limite }} {{ s.fecha_limite | date: 'longDate' }}</span
            >
          </li>
        }
      </ul>
    }
  `,
  styles: `
    form {
      margin-bottom: var(--espacio-5);
    }

    h3 {
      font-size: var(--texto-md);
    }

    .solicitud {
      padding-block: var(--espacio-2);
      border-bottom: 1px solid var(--color-borde);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeccionSolicitudesComponent {
  readonly solicitudes = input.required<readonly SolicitudPublica[]>();
  readonly enviando = input(false);
  /** Se incrementa cuando el contenedor confirma que la solicitud se creó. */
  readonly creadas = input(0);
  readonly crear = output<SolicitudEntrada>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly textos = TEXTOS_PRIVACIDAD.solicitudes;
  protected readonly tipos = TIPOS_SOLICITUD;
  protected readonly nombresTipo = NOMBRE_TIPO_SOLICITUD;
  protected readonly nombresEstado = NOMBRE_ESTADO_SOLICITUD;
  protected readonly maximo = LONGITUD_MAX_DETALLE_SOLICITUD;

  protected readonly form = inject(NonNullableFormBuilder).group({
    tipo: ['CONSULTA' as TipoSolicitud, [Validators.required]],
    detalle: [
      '',
      [
        Validators.required,
        longitudTextoValidator(LONGITUD_MIN_DETALLE_SOLICITUD, LONGITUD_MAX_DETALLE_SOLICITUD),
      ],
    ],
  });

  constructor() {
    effect(() => {
      if (this.creadas() > 0) {
        this.form.reset();
      }
    });
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      enfocarPrimerError(this.host.nativeElement);
      return;
    }
    const { tipo, detalle } = this.form.getRawValue();
    this.crear.emit({ tipo, detalle: normalizarTexto(detalle) });
  }
}
