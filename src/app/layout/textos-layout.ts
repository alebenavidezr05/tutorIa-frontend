import { environment } from '../../environments/environment';

const tutor = environment.tutorNombre;

export const LEMA = 'Aprendamos juntos, paso a paso';

/**
 * Glosario: TutorIA es la aplicación (nunca habla en primera persona ni se llama «tutor»);
 * Vex es el avatar que guía a la persona y es el único que habla en primera persona.
 */
export const DESCRIPCION_TUTORIA =
  'TutorIA es una aplicación de estudio que usa inteligencia artificial para guiarte en tu proceso de aprendizaje.';
export const PRESENTACION_VEX = `Soy ${tutor}, tu guía: te acompaño paso a paso desde el primer tema hasta tu plan de estudio.`;

/** Cómo funciona, en tres pasos (portada, ingreso, registro y /tema). */
export const PASOS_COMO_FUNCIONA = [
  { icono: 'enviar', texto: `Cuéntale a ${tutor} qué quieres aprender` },
  { icono: 'check', texto: 'Responde unas preguntas para conocer tu punto de partida' },
  { icono: 'ia', texto: 'Recibe tu plan: explicación, técnicas y actividades hechas para ti' },
] as const;

/** Panel de las pantallas de ingreso y registro: qué es TutorIA, quién es Vex y cómo funciona. */
export const TEXTOS_PORTADA = {
  queEs: DESCRIPCION_TUTORIA,
  vex: PRESENTACION_VEX,
  comoFuncionaTitulo: 'Cómo funciona',
  pasos: PASOS_COMO_FUNCIONA,
} as const;

export const TEXTOS_ACOMPANAMIENTO = `${tutor} está contigo en cada paso.`;

export const ENLACES_NAVEGACION = [
  { ruta: '/tema', texto: 'Tema' },
  { ruta: '/tutor', texto: `Chat con ${tutor}` },
  { ruta: '/historial', texto: 'Historial' },
  { ruta: '/planes', texto: 'Planes' },
  { ruta: '/perfil', texto: 'Perfil' },
] as const;

export const TEXTOS_SHELL = {
  navegacion: 'Navegación principal',
  menu: 'Menú',
  cerrarMenu: 'Cerrar menú',
  cerrarSesion: 'Cerrar sesión',
  ingresar: 'Ingresar',
  irInicio: 'Ir al inicio',
  sesionCerrada: 'Cerraste sesión. ¡Vuelve pronto!',
  pie: {
    cumplimiento: 'Cumplimiento y uso de IA',
    politica: 'Política de datos',
    privacidad: 'Mis datos y privacidad',
  },
} as const;
