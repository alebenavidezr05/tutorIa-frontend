import { NivelCognitivo } from '../../core/models';

/** Microcopy compartido de los componentes de `shared/ui`. */
export const NIVELES: Record<NivelCognitivo, { etiqueta: string; descripcion: string }> = {
  BASICO: {
    etiqueta: 'Básico',
    descripcion: 'Estás empezando con este tema. Vamos paso a paso, desde las ideas clave.',
  },
  INTERMEDIO: {
    etiqueta: 'Intermedio',
    descripcion: 'Ya tienes bases. Vamos a reforzarlas y a aplicarlas en ejercicios.',
  },
  AVANZADO: {
    etiqueta: 'Avanzado',
    descripcion:
      'Dominas lo esencial. Vamos a profundizar, conectar ideas y explicar con tus palabras.',
  },
};

export const TEXTO_PREMIUM = {
  titulo: 'Esta función es de Premium',
  boton: 'Ver planes',
  incluye: [
    'Historial completo de tus planes',
    'Reporte de progreso descargable',
    'Varios temas a la vez con el tutor',
    'Más mensajes, ilustraciones y archivos por día',
  ],
} as const;

export const TEXTO_ARCHIVO = {
  boton: 'Adjuntar archivo',
  soltar: 'o arrástralo aquí',
  formatos: 'Texto (.txt), PDF, PNG, JPEG o WebP. Máximo 5 MB.',
  aviso:
    'Tu archivo se envía a la IA para recibir retroalimentación. No incluyas datos personales de otras personas.',
  quitar: 'Quitar archivo',
  subiendo: 'Subiendo archivo',
} as const;

export const TEXTO_ENLACE_EXTERNO = '(se abre en una pestaña nueva)';
