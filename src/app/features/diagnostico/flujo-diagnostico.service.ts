import { Injectable, computed, signal } from '@angular/core';
import {
  CuestionarioPublico,
  OpcionLetra,
  PreguntaPublica,
  RespuestaPregunta,
  ResultadoDiagnostico,
  Uuid,
} from '../../core/models';

/**
 * Estado del cuestionario en curso (preguntas, índice, respuestas parciales y resultado).
 * No hace HTTP: lo hacen los servicios de API y la página orquesta.
 */
@Injectable({ providedIn: 'root' })
export class FlujoDiagnosticoService {
  private readonly _cuestionario = signal<CuestionarioPublico | null>(null);
  private readonly _indice = signal(0);
  private readonly _respuestas = signal<Readonly<Record<Uuid, OpcionLetra>>>({});
  private readonly _resultado = signal<ResultadoDiagnostico | null>(null);

  readonly cuestionario = this._cuestionario.asReadonly();
  readonly indice = this._indice.asReadonly();
  readonly respuestas = this._respuestas.asReadonly();

  readonly preguntas = computed<readonly PreguntaPublica[]>(() =>
    [...(this._cuestionario()?.preguntas ?? [])].sort((a, b) => a.orden - b.orden),
  );
  readonly total = computed(() => this.preguntas().length);
  readonly preguntaActual = computed(() => this.preguntas()[this._indice()] ?? null);
  readonly respuestaActual = computed(() => {
    const pregunta = this.preguntaActual();
    return pregunta ? (this._respuestas()[pregunta.id_pregunta] ?? null) : null;
  });
  readonly esPrimera = computed(() => this._indice() === 0);
  readonly esUltima = computed(() => this._indice() >= this.total() - 1);
  readonly completo = computed(
    () =>
      this.total() > 0 &&
      this.preguntas().every((p) => this._respuestas()[p.id_pregunta] !== undefined),
  );
  readonly respuestasLista = computed<RespuestaPregunta[]>(() =>
    this.preguntas().flatMap((p) => {
      const respuesta = this._respuestas()[p.id_pregunta];
      return respuesta ? [{ id_pregunta: p.id_pregunta, respuesta }] : [];
    }),
  );

  /** Carga un cuestionario. Si es el mismo que ya estaba en curso, conserva el avance. */
  iniciar(cuestionario: CuestionarioPublico): void {
    if (this._cuestionario()?.id_sesion === cuestionario.id_sesion) {
      this._cuestionario.set(cuestionario);
      return;
    }
    this._cuestionario.set(cuestionario);
    this._indice.set(0);
    this._respuestas.set({});
    this._resultado.set(null);
  }

  estaEnCurso(idSesion: Uuid): boolean {
    return this._cuestionario()?.id_sesion === idSesion;
  }

  responder(opcion: OpcionLetra): void {
    const pregunta = this.preguntaActual();
    if (pregunta) {
      this._respuestas.update((r) => ({ ...r, [pregunta.id_pregunta]: opcion }));
    }
  }

  siguiente(): void {
    if (this.respuestaActual() !== null && !this.esUltima()) {
      this._indice.update((i) => i + 1);
    }
  }

  anterior(): void {
    if (!this.esPrimera()) {
      this._indice.update((i) => i - 1);
    }
  }

  guardarResultado(resultado: ResultadoDiagnostico): void {
    this._resultado.set(resultado);
  }

  resultadoDe(idSesion: Uuid): ResultadoDiagnostico | null {
    const resultado = this._resultado();
    return resultado?.id_sesion === idSesion ? resultado : null;
  }

  reiniciar(): void {
    this._cuestionario.set(null);
    this._indice.set(0);
    this._respuestas.set({});
    this._resultado.set(null);
  }
}
