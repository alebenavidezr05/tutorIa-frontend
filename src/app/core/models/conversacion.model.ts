import { FechaIso, NivelCognitivo, Pagina, Uuid } from './comunes.model';
import { FuentePublica, ReferenciaPublica } from './fuente.model';
import { ArchivoPublico } from './plan.model';
import { VisualPublico } from './visual.model';

export type EstadoConversacion = 'ABIERTA' | 'CERRADA';
export type RolMensaje = 'USUARIO' | 'TUTOR';
export type AmbitoMensaje = 'ACADEMICO' | 'NO_ACADEMICO' | 'RIESGO';
export type MotivoFeedback =
  'MUY_LARGO' | 'MUY_CORTO' | 'NO_ENTENDI' | 'MUY_FACIL' | 'MUY_DIFICIL' | 'OTRO';
export type CategoriaReporte =
  | 'AUTOLESION'
  | 'SEXUAL'
  | 'VIOLENCIA'
  | 'ACOSO'
  | 'ILICITO'
  | 'NO_ACADEMICO_REITERADO'
  | 'CONTENIDO_INCORRECTO'
  | 'OTRO';

// ---- Bloques del tutor (unión discriminada por `tipo`) ----

interface ConFuentes {
  /** Identificadores de `MensajePublico.fuentes` que respaldan el bloque. */
  fuentes?: Uuid[];
}

export interface BloqueTexto extends ConFuentes {
  tipo: 'texto';
  contenido: string;
}

export interface BloquePasos extends ConFuentes {
  tipo: 'pasos';
  titulo: string;
  pasos: string[];
}

export interface BloqueEjemplo extends ConFuentes {
  tipo: 'ejemplo';
  titulo: string;
  contenido: string;
}

export interface BloqueAnalogia extends ConFuentes {
  tipo: 'analogia';
  contenido: string;
}

export interface BloqueFormula extends ConFuentes {
  tipo: 'formula';
  latex: string;
  descripcion: string;
}

export interface BloquePreguntaComprension {
  tipo: 'pregunta_comprension';
  enunciado: string;
}

export interface BloqueVideo {
  tipo: 'video';
  id_video: Uuid;
  youtube_id: string;
  titulo: string;
  canal: string;
  duracion_segundos: number;
  url: string;
  verificado: boolean;
}

export interface BloquePreguntaResumen {
  tipo: 'pregunta_resumen';
  enunciado: string;
  id_video: Uuid;
}

export type BloqueTutor =
  | BloqueTexto
  | BloquePasos
  | BloqueEjemplo
  | BloqueAnalogia
  | BloqueFormula
  | BloquePreguntaComprension
  | BloqueVideo
  | BloquePreguntaResumen;

export type TipoBloque = BloqueTutor['tipo'];

// ---- Conversaciones y mensajes ----

export interface ConversacionPublica {
  id_conversacion: Uuid;
  tema: string;
  estado: EstadoConversacion;
  nivel_cognitivo: NivelCognitivo;
  id_plan: Uuid | null;
  acepta_archivos: boolean;
  fecha_inicio: FechaIso;
  fecha_ultimo_mensaje: FechaIso;
}

export type ConversacionesPagina = Pagina<ConversacionPublica>;

export interface MensajePublico {
  id_mensaje: Uuid;
  rol: RolMensaje;
  contenido: string;
  bloques: BloqueTutor[] | null;
  fuentes: FuentePublica[];
  visual: VisualPublico | null;
  archivo: ArchivoPublico | null;
  util: boolean | null;
  fecha: FechaIso;
}

export interface ConversacionDetalle extends ConversacionPublica {
  mensajes: MensajePublico[];
}

/**
 * Respuesta del tutor a un mensaje. Si `ambito` no es ACADEMICO, `bloques` viene vacío y
 * `contenido` trae el texto fijo del sistema.
 */
export interface MensajeTutorPublico {
  id_mensaje: Uuid;
  ambito: AmbitoMensaje;
  contenido?: string;
  bloques: BloqueTutor[];
  fuentes: FuentePublica[];
  visual: VisualPublico | null;
  formatos_usados: string[];
  validado: boolean;
  fecha: FechaIso;
}

export interface IniciarConversacionEntrada {
  tema?: string;
  id_plan?: Uuid;
}

export interface ResumenSesion {
  resumen: string;
  referencias: ReferenciaPublica[];
  aviso: string;
}

export interface FeedbackEntrada {
  util: boolean;
  motivo?: MotivoFeedback;
}

export interface ReporteEntrada {
  categoria: CategoriaReporte;
  comentario?: string;
}
