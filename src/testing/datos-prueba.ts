import {
  ConversacionDetalle,
  CuestionarioPublico,
  FuentePublica,
  MensajeTutorPublico,
  PlanDetalle,
  PoliticaPublica,
  SuscripcionPublica,
  UsuarioPublico,
  VisualPublico,
} from '../app/core/models';

export function usuarioPrueba(cambios: Partial<UsuarioPublico> = {}): UsuarioPublico {
  return {
    id_usuario: 'u-1',
    nombre: 'Laura Gómez',
    correo: 'laura@correo.com',
    tipo_nivel: 'COLEGIO',
    nivel_educativo: '10',
    estado_cuenta: 'ACTIVA',
    es_menor: false,
    fecha_registro: '2026-10-01T10:00:00Z',
    ...cambios,
  };
}

export function politicaPrueba(cambios: Partial<PoliticaPublica> = {}): PoliticaPublica {
  return {
    version: '1',
    texto: '# Política\n\n## 1. Marco\nLey 1581 de 2012.',
    responsable: {
      razon_social: 'TutorIA S.A.S.',
      nit: '900.000.000-1',
      domicilio: 'Bogotá',
      correo_datos: 'datos@tutoria.co',
    },
    finalidades: [
      {
        finalidad: 'TRATAMIENTO',
        obligatoria: true,
        texto: 'Autorizo el tratamiento de mis datos.',
      },
      {
        finalidad: 'TRANSFERENCIA_INTERNACIONAL',
        obligatoria: true,
        texto:
          'Autorizo la transferencia a proveedores fuera de Colombia (Anthropic, OpenAI y AWS en EE. UU.).',
      },
      { finalidad: 'PERSONALIZACION', obligatoria: false, texto: 'Autorizo la personalización.' },
      { finalidad: 'COMUNICACIONES', obligatoria: false, texto: 'Acepto correos de novedades.' },
      { finalidad: 'COMPRAS_MENOR', obligatoria: false, texto: 'Autorizo compras del estudiante.' },
      { finalidad: 'OPINION_MENOR', obligatoria: false, texto: 'Entiendo qué datos se guardan.' },
    ],
    vigente_desde: '2026-10-18',
    ...cambios,
  };
}

export function fuentePrueba(cambios: Partial<FuentePublica> = {}): FuentePublica {
  return {
    id_fuente: 'f-1',
    tipo: 'TEXTO',
    categoria: 'EDUCATIVA_ABIERTA',
    titulo: 'Fracciones equivalentes',
    sitio: 'Colombia Aprende',
    url: 'https://colombiaaprende.edu.co/fracciones',
    autor: 'MEN',
    doi: null,
    licencia: 'CC BY',
    ...cambios,
  };
}

export function cuestionarioPrueba(): CuestionarioPublico {
  return {
    id_sesion: 's-1',
    tema: 'Fracciones',
    materia: 'Matemáticas',
    preguntas: [
      {
        id_pregunta: 'p-2',
        orden: 2,
        enunciado: '¿Cuánto es 1/2 + 1/2?',
        opciones: { a: '1', b: '2', c: '1/4', d: '0' },
      },
      {
        id_pregunta: 'p-1',
        orden: 1,
        enunciado: '¿Qué es una fracción?',
        opciones: { a: 'Parte', b: 'Todo', c: 'Nada', d: 'Otro' },
      },
      {
        id_pregunta: 'p-3',
        orden: 3,
        enunciado: '¿2/4 equivale a?',
        opciones: { a: '1/3', b: '1/2', c: '3/4', d: '2' },
      },
    ],
  };
}

export function planPrueba(cambios: Partial<PlanDetalle> = {}): PlanDetalle {
  return {
    id_plan: 'plan-1',
    id_sesion: 's-1',
    titulo: 'Fracciones paso a paso',
    explicacion: 'Una fracción representa partes de un todo.',
    tecnicas_estudio: ['Práctica espaciada'],
    nivel_bloom: 'AVANZADO',
    validado: true,
    estado: 'GENERADO',
    fecha_generacion: '2026-10-18T10:00:00Z',
    actividades: [
      {
        id_actividad: 'a-1',
        numero_orden: 1,
        enunciado: 'Explica con tus palabras qué es una fracción.',
        respuesta_usuario: null,
        archivo: null,
        estado: 'PENDIENTE',
        fecha_completado: null,
      },
    ],
    fuentes: [fuentePrueba()],
    acepta_archivos: true,
    ...cambios,
  };
}

export function suscripcionPrueba(cambios: Partial<SuscripcionPublica> = {}): SuscripcionPublica {
  return {
    plan: 'GRATUITO',
    estado: 'ACTIVA',
    fecha_inicio: '2026-10-01T00:00:00Z',
    fecha_fin: null,
    capacidades: [],
    limites: {
      mensajes_restantes_hoy: 20,
      planes_restantes_hoy: 5,
      imagenes_ia_restantes_hoy: 2,
      busquedas_video_restantes_hoy: 5,
      archivos_restantes_hoy: 3,
    },
    ...cambios,
  };
}

export function visualPrueba(cambios: Partial<VisualPublico> = {}): VisualPublico {
  return {
    estado: 'LISTO',
    tipo: 'REAL',
    imagen: {
      url: '/api/v1/visuales/v-1/imagen',
      texto_alternativo: 'Pizza dividida en cuatro partes',
      pie: 'Una pizza dividida en cuartos',
      autor: 'Ana Pérez',
      licencia: 'CC BY-SA 4.0',
      url_licencia: 'https://creativecommons.org/licenses/by-sa/4.0/',
      url_origen: 'https://commons.wikimedia.org/wiki/File:Pizza.jpg',
      proveedor: 'Wikimedia Commons',
    },
    diagrama: null,
    generado_por_ia: false,
    aviso_ia: null,
    ...cambios,
  };
}

export function conversacionPrueba(
  cambios: Partial<ConversacionDetalle> = {},
): ConversacionDetalle {
  return {
    id_conversacion: 'c-1',
    tema: 'Fracciones',
    estado: 'ABIERTA',
    nivel_cognitivo: 'INTERMEDIO',
    id_plan: null,
    acepta_archivos: false,
    fecha_inicio: '2026-10-18T10:00:00Z',
    fecha_ultimo_mensaje: '2026-10-18T10:05:00Z',
    mensajes: [],
    ...cambios,
  };
}

export function respuestaTutorPrueba(
  cambios: Partial<MensajeTutorPublico> = {},
): MensajeTutorPublico {
  return {
    id_mensaje: 'm-tutor-1',
    ambito: 'ACADEMICO',
    bloques: [
      { tipo: 'texto', contenido: 'Una fracción es una parte de un todo.', fuentes: ['f-1'] },
    ],
    fuentes: [fuentePrueba()],
    visual: null,
    formatos_usados: ['TEORIA'],
    validado: true,
    fecha: '2026-10-18T10:06:00Z',
    ...cambios,
  };
}

/** Cuerpo de error uniforme del backend. */
export function cuerpoError(
  codigo: string,
  mensaje = 'Mensaje del servidor',
  detalles: unknown = null,
) {
  return { error: { codigo, mensaje, detalles } };
}
