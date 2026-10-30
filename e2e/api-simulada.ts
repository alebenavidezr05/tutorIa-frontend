import { Page, Route } from '@playwright/test';

/** Respuestas simuladas de la API para probar la interfaz sin backend. */
const usuario = {
  id_usuario: 'u-1',
  nombre: 'Laura Gómez',
  correo: 'laura@correo.com',
  tipo_nivel: 'COLEGIO',
  nivel_educativo: '10',
  estado_cuenta: 'ACTIVA',
  es_menor: false,
  fecha_registro: '2026-10-01T10:00:00Z',
};

const fuente = {
  id_fuente: 'f-1',
  tipo: 'TEXTO',
  categoria: 'EDUCATIVA_ABIERTA',
  titulo: 'Fracciones equivalentes y su representación gráfica en la recta numérica',
  sitio: 'Colombia Aprende',
  url: 'https://colombiaaprende.edu.co/fracciones',
  autor: 'Ministerio de Educación Nacional',
  doi: null,
  licencia: 'CC BY',
};

const politica = {
  version: '1',
  texto: '# Política de tratamiento de datos\n\n## 1. Marco normativo\nLey 1581 de 2012.',
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
      texto: 'Autorizo el tratamiento de mis datos personales para crear y operar mi cuenta.',
    },
    {
      finalidad: 'TRANSFERENCIA_INTERNACIONAL',
      obligatoria: true,
      texto:
        'Autorizo la transferencia a proveedores fuera de Colombia (Anthropic, OpenAI y Amazon Web Services en Estados Unidos).',
    },
    {
      finalidad: 'PERSONALIZACION',
      obligatoria: false,
      texto: 'Autorizo que TutorIA aprenda cómo prefiero que me expliquen.',
    },
    {
      finalidad: 'COMUNICACIONES',
      obligatoria: false,
      texto: 'Acepto recibir correos sobre novedades.',
    },
    {
      finalidad: 'COMPRAS_MENOR',
      obligatoria: false,
      texto: 'Autorizo que el estudiante adquiera el plan Premium.',
    },
    {
      finalidad: 'OPINION_MENOR',
      obligatoria: false,
      texto: 'Entiendo qué datos guarda TutorIA sobre mí.',
    },
  ],
  vigente_desde: '2026-10-18',
};

const suscripcion = {
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
};

const plan = {
  id_plan: 'plan-1',
  id_sesion: 's-1',
  titulo: 'Fracciones equivalentes paso a paso',
  explicacion: 'Dos fracciones son equivalentes cuando representan la misma parte de un todo.',
  tecnicas_estudio: ['Práctica espaciada', 'Explicarlo con tus palabras'],
  nivel_bloom: 'AVANZADO',
  validado: false,
  estado: 'GENERADO',
  fecha_generacion: '2026-10-18T10:00:00Z',
  actividades: [
    {
      id_actividad: 'a-1',
      numero_orden: 1,
      enunciado: 'Explica con tus palabras por qué 2/4 y 1/2 son equivalentes.',
      respuesta_usuario: null,
      archivo: null,
      estado: 'PENDIENTE',
      fecha_completado: null,
    },
  ],
  fuentes: [fuente],
  acepta_archivos: true,
};

const conversacion = {
  id_conversacion: 'c-1',
  tema: 'Fracciones equivalentes',
  estado: 'ABIERTA',
  nivel_cognitivo: 'AVANZADO',
  id_plan: null,
  acepta_archivos: true,
  fecha_inicio: '2026-10-18T10:00:00Z',
  fecha_ultimo_mensaje: '2026-10-18T10:05:00Z',
  mensajes: [
    {
      id_mensaje: 'm-1',
      rol: 'USUARIO',
      contenido: '¿Qué son las fracciones equivalentes?',
      bloques: null,
      fuentes: [],
      visual: null,
      archivo: null,
      util: null,
      fecha: '2026-10-18T10:01:00Z',
    },
    {
      id_mensaje: 'm-2',
      rol: 'TUTOR',
      contenido: '',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'Son fracciones que valen lo mismo aunque se escriban distinto.',
          fuentes: ['f-1'],
        },
        {
          tipo: 'formula',
          latex:
            '\\frac{a}{b} = \\frac{a \\cdot k}{b \\cdot k} \\quad k \\neq 0 \\quad \\text{(muy larga para probar el desplazamiento)}',
          descripcion: 'Multiplicar arriba y abajo por el mismo número.',
        },
        {
          tipo: 'video',
          id_video: 'v-1',
          youtube_id: 'dQw4w9WgXcQ',
          titulo: 'Fracciones equivalentes en 5 minutos',
          canal: 'Profe Ana',
          duracion_segundos: 305,
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          verificado: true,
        },
        { tipo: 'pregunta_resumen', enunciado: '¿Qué aprendiste del video?', id_video: 'v-1' },
      ],
      fuentes: [fuente],
      visual: {
        estado: 'LISTO',
        tipo: 'DIAGRAMA',
        imagen: null,
        diagrama: {
          tipo_diagrama: 'mapa_conceptual',
          titulo: 'Fracciones equivalentes',
          nodos: Array.from({ length: 12 }, (_, i) => ({
            id: `n${i}`,
            texto: i === 0 ? 'Fracción' : `Concepto relacionado ${i}`,
          })),
          aristas: Array.from({ length: 11 }, (_, i) => ({
            desde: 'n0',
            hasta: `n${i + 1}`,
            etiqueta: 'se relaciona',
          })),
        },
        generado_por_ia: false,
        aviso_ia: null,
      },
      archivo: null,
      util: null,
      fecha: '2026-10-18T10:02:00Z',
    },
  ],
};

function json(route: Route, cuerpo: unknown, status = 200): Promise<void> {
  return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(cuerpo) });
}

export interface OpcionesApiSimulada {
  conSesion: boolean;
}

export async function simularApi(page: Page, { conSesion }: OpcionesApiSimulada): Promise<void> {
  // Bloquea cualquier recurso de terceros: la app no debe pedir nada fuera de su origen.
  await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());

  await page.route('**/api/v1/**', (route) => {
    const url = new URL(route.request().url());
    const ruta = url.pathname.replace('/api/v1', '');
    const respuestas: Record<string, unknown> = {
      '/politica-tratamiento': politica,
      '/suscripcion': suscripcion,
      '/plan-aprendizaje/plan-1': plan,
      '/conversaciones/c-1': conversacion,
      '/conversaciones': { items: [conversacion], total: 1, pagina: 1, tamano: 20 },
      '/historial/u-1': {
        items: [
          {
            id_sesion: 's-1',
            id_plan: 'plan-1',
            tema: 'Fracciones equivalentes',
            nivel_estimado: 'AVANZADO',
            fecha: '2026-10-18T10:00:00Z',
          },
        ],
        total: 1,
        pagina: 1,
        tamano: 10,
        limitado: true,
      },
      '/perfil/u-1': usuario,
    };
    if (ruta === '/auth/me') {
      return conSesion
        ? json(route, usuario)
        : json(
            route,
            { error: { codigo: 'SESION_INVALIDA', mensaje: 'Sin sesión', detalles: null } },
            401,
          );
    }
    if (ruta in respuestas) {
      return json(route, respuestas[ruta]);
    }
    return json(
      route,
      { error: { codigo: 'RECURSO_NO_ENCONTRADO', mensaje: 'No encontrado', detalles: null } },
      404,
    );
  });
}
