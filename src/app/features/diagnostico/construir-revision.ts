import {
  CuestionarioPublico,
  OpcionLetra,
  OpcionRespuesta,
  PreguntaPublica,
  ResultadoDiagnostico,
} from '../../core/models';
import { ReferenciaVista, fuenteAReferencia } from '../../shared/utils/referencias';

export interface OpcionRevision {
  readonly letra: string;
  readonly texto: string;
}

export interface ItemRevision {
  readonly id: string;
  readonly numero: number;
  readonly enunciado: string;
  readonly esCorrecta: boolean;
  readonly tuRespuesta: OpcionRevision;
  readonly correcta: OpcionRevision;
  readonly fuentes: readonly ReferenciaVista[];
}

function _opcion(pregunta: PreguntaPublica | undefined, letra: OpcionRespuesta): OpcionRevision {
  const clave = letra.toLowerCase() as OpcionLetra;
  return { letra, texto: pregunta?.opciones[clave] ?? '' };
}

/** Une el resultado con el cuestionario para mostrar cada pregunta con su respuesta correcta. */
export function construirRevision(
  cuestionario: CuestionarioPublico | null,
  resultado: ResultadoDiagnostico,
): ItemRevision[] {
  const preguntas = new Map((cuestionario?.preguntas ?? []).map((p) => [p.id_pregunta, p]));
  return resultado.resultados.map((r, indice) => {
    const pregunta = preguntas.get(r.id_pregunta);
    return {
      id: r.id_pregunta,
      numero: pregunta?.orden ?? indice + 1,
      enunciado: pregunta?.enunciado ?? `Pregunta ${indice + 1}`,
      esCorrecta: r.es_correcta,
      tuRespuesta: _opcion(pregunta, r.respuesta_usuario),
      correcta: _opcion(pregunta, r.respuesta_correcta),
      fuentes: r.fuente ? [fuenteAReferencia(r.fuente)] : [],
    };
  });
}
