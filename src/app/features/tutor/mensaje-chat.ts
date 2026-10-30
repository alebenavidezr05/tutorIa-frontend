import {
  AmbitoMensaje,
  ArchivoPublico,
  BloqueTutor,
  FuentePublica,
  MensajePublico,
  MensajeTutorPublico,
  RolMensaje,
  TipoBloque,
  VisualPublico,
} from '../../core/models';

/** Mensaje tal como lo pinta el chat (une los dos formatos de la API). */
export interface MensajeChat {
  readonly id: string;
  readonly rol: RolMensaje;
  readonly contenido: string;
  readonly bloques: readonly BloqueTutor[];
  readonly fuentes: readonly FuentePublica[];
  readonly visual: VisualPublico | null;
  readonly archivo: ArchivoPublico | null;
  readonly util: boolean | null;
  readonly ambito: AmbitoMensaje;
  readonly validado: boolean;
  readonly fecha: string;
  /** Mensaje del estudiante aún no confirmado por el servidor. */
  readonly local: boolean;
}

export const TIPOS_BLOQUE_CONOCIDOS: ReadonlySet<TipoBloque> = new Set<TipoBloque>([
  'texto',
  'pasos',
  'ejemplo',
  'analogia',
  'formula',
  'pregunta_comprension',
  'video',
  'pregunta_resumen',
]);

/** Descarta bloques de tipo desconocido o mal formados: no rompen la pantalla. */
export function bloquesConocidos(bloques: readonly unknown[] | null | undefined): BloqueTutor[] {
  return (bloques ?? []).filter(
    (b): b is BloqueTutor =>
      typeof b === 'object' &&
      b !== null &&
      'tipo' in b &&
      typeof b.tipo === 'string' &&
      TIPOS_BLOQUE_CONOCIDOS.has(b.tipo as TipoBloque),
  );
}

export function desdeMensajePublico(m: MensajePublico): MensajeChat {
  const bloques = bloquesConocidos(m.bloques);
  // El historial no trae `ambito`: una respuesta del tutor sin bloques es un aviso del sistema.
  const ambito: AmbitoMensaje =
    m.rol === 'TUTOR' && bloques.length === 0 ? 'NO_ACADEMICO' : 'ACADEMICO';
  return {
    id: m.id_mensaje,
    rol: m.rol,
    contenido: m.contenido,
    bloques,
    fuentes: m.fuentes,
    visual: m.visual,
    archivo: m.archivo,
    util: m.util,
    ambito,
    validado: true,
    fecha: m.fecha,
    local: false,
  };
}

export function desdeMensajeTutor(m: MensajeTutorPublico, textoSistema: string): MensajeChat {
  const academico = m.ambito === 'ACADEMICO';
  return {
    id: m.id_mensaje,
    rol: 'TUTOR',
    contenido: m.contenido ?? (academico ? '' : textoSistema),
    bloques: academico ? bloquesConocidos(m.bloques) : [],
    fuentes: m.fuentes,
    visual: m.visual,
    archivo: null,
    util: null,
    ambito: m.ambito,
    validado: m.validado,
    fecha: m.fecha,
    local: false,
  };
}

export function mensajeLocalDeUsuario(
  contenido: string,
  archivo: ArchivoPublico | null,
  ahora: Date = new Date(),
): MensajeChat {
  return {
    id: `local-${ahora.getTime()}`,
    rol: 'USUARIO',
    contenido,
    bloques: [],
    fuentes: [],
    visual: null,
    archivo,
    util: null,
    ambito: 'ACADEMICO',
    validado: true,
    fecha: ahora.toISOString(),
    local: true,
  };
}

/** Texto breve para anunciar la respuesta por `aria-live`. */
export function resumenParaAnunciar(mensaje: MensajeChat, maximo = 160): string {
  const primero = mensaje.bloques[0];
  const texto =
    primero && 'contenido' in primero
      ? primero.contenido
      : primero && 'enunciado' in primero
        ? primero.enunciado
        : primero && 'titulo' in primero
          ? primero.titulo
          : mensaje.contenido;
  return texto.length > maximo ? `${texto.slice(0, maximo - 1)}…` : texto;
}
