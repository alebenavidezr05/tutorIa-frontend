import { NivelCognitivo, OpcionLetra, OpcionRespuesta, Uuid } from './comunes.model';
import { FuentePublica } from './fuente.model';

export interface OpcionesPregunta {
  a: string;
  b: string;
  c: string;
  d: string;
}

export interface PreguntaPublica {
  id_pregunta: Uuid;
  orden: number;
  enunciado: string;
  opciones: OpcionesPregunta;
}

/** Nunca incluye la respuesta correcta. */
export interface CuestionarioPublico {
  id_sesion: Uuid;
  tema: string;
  materia: string;
  preguntas: PreguntaPublica[];
}

export interface RespuestaPregunta {
  id_pregunta: Uuid;
  respuesta: OpcionLetra;
}

export interface ResultadoPregunta {
  id_pregunta: Uuid;
  respuesta_usuario: OpcionRespuesta;
  es_correcta: boolean;
  respuesta_correcta: OpcionRespuesta;
  fuente: FuentePublica | null;
}

export interface ResultadoDiagnostico {
  id_sesion: Uuid;
  nivel_estimado: NivelCognitivo;
  /** Decimal serializado (número o cadena según el backend). */
  puntaje: number | string;
  aciertos: number;
  total_preguntas: number;
  resultados: ResultadoPregunta[];
}
