import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnInit,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DiagnosticoApiService } from '../../../core/api/diagnostico-api.service';
import { OpcionLetra, comoApiError, tieneCodigo } from '../../../core/models';
import { BarraProgresoComponent } from '../../../shared/ui/barra-progreso/barra-progreso.component';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { EstadoVacioComponent } from '../../../shared/ui/estado-vacio/estado-vacio.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { VexComponent } from '../../../shared/ui/vex/vex.component';
import { conIndicador } from '../../../shared/utils/con-indicador';
import { TEXTOS_CUESTIONARIO } from '../diagnostico.textos';
import { FlujoDiagnosticoService } from '../flujo-diagnostico.service';

const LETRAS: readonly OpcionLetra[] = ['a', 'b', 'c', 'd'];

@Component({
  selector: 'app-cuestionario-page',
  imports: [
    RouterLink,
    BarraProgresoComponent,
    BotonComponent,
    EstadoVacioComponent,
    SpinnerComponent,
    VexComponent,
  ],
  templateUrl: './cuestionario-page.component.html',
  styleUrl: './cuestionario-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CuestionarioPageComponent implements OnInit {
  readonly idSesion = input.required<string>();

  private readonly api = inject(DiagnosticoApiService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  protected readonly flujo = inject(FlujoDiagnosticoService);
  private readonly enunciado = viewChild<ElementRef<HTMLElement>>('enunciado');

  protected readonly textos = TEXTOS_CUESTIONARIO;
  protected readonly cargando = signal(false);
  protected readonly enviando = signal(false);
  protected readonly error = signal(false);

  protected readonly opciones = computed(() => {
    const pregunta = this.flujo.preguntaActual();
    return pregunta
      ? LETRAS.map((letra) => ({
          letra,
          etiqueta: letra.toUpperCase(),
          texto: pregunta.opciones[letra],
        }))
      : [];
  });
  protected readonly progreso = computed(() =>
    this.textos.progreso(this.flujo.indice() + 1, this.flujo.total()),
  );
  protected readonly nombreGrupo = computed(
    () => `pregunta-${this.flujo.preguntaActual()?.id_pregunta ?? ''}`,
  );

  ngOnInit(): void {
    // Si se recarga la página, el cuestionario se vuelve a pedir al backend.
    if (!this.flujo.estaEnCurso(this.idSesion())) {
      this.cargar();
    }
  }

  protected cargar(): void {
    this.error.set(false);
    this.api
      .obtener(this.idSesion())
      .pipe(conIndicador(this.cargando))
      .subscribe({
        next: (cuestionario) => this.flujo.iniciar(cuestionario),
        error: () => this.error.set(true),
      });
  }

  protected responder(letra: OpcionLetra): void {
    this.flujo.responder(letra);
  }

  protected siguiente(): void {
    this.flujo.siguiente();
    this.enfocarPregunta();
  }

  protected anterior(): void {
    this.flujo.anterior();
    this.enfocarPregunta();
  }

  protected enviar(): void {
    if (!this.flujo.completo()) {
      return;
    }
    const idSesion = this.idSesion();
    this.api
      .enviarRespuestas(idSesion, this.flujo.respuestasLista())
      .pipe(conIndicador(this.enviando))
      .subscribe({
        next: (resultado) => {
          this.flujo.guardarResultado(resultado);
          void this.router.navigate(['/diagnostico', idSesion, 'resultado']);
        },
        error: (e: unknown) => {
          if (tieneCodigo(comoApiError(e), 'SESION_YA_EVALUADA')) {
            void this.router.navigate(['/diagnostico', idSesion, 'resultado']);
          }
        },
      });
  }

  /** Al cambiar de pregunta, el foco va al enunciado para que el lector de pantalla lo lea. */
  private enfocarPregunta(): void {
    afterNextRender(() => this.enunciado()?.nativeElement.focus(), { injector: this.injector });
  }
}
