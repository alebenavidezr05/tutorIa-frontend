import { environment } from '../../environments/environment';

const tutor = environment.tutorNombre;

export const LEMA = 'Aprendamos juntos, paso a paso';
export const LEMA_SECUNDARIO = 'Te guío paso a paso hasta que la respuesta aparezca';

/** Portada (pantalla de ingreso): qué es TutorIA y cómo funciona. */
export const TEXTOS_PORTADA = {
  saludo: `Hola, soy ${tutor}. Tu compañero de aprendizaje.`,
  queEs:
    'TutorIA es tu tutor de estudio con inteligencia artificial: cuéntame qué quieres aprender y armamos juntos tu camino.',
  comoFuncionaTitulo: 'Así funciona',
  pasos: [
    `Cuéntale a ${tutor} qué quieres aprender.`,
    'Responde unas preguntas cortas para que conozca tu punto de partida.',
    'Recibe una explicación, técnicas de estudio y actividades hechas para ti.',
  ],
  crearCuenta: 'Crear cuenta',
} as const;

/** Panel lateral del registro: beneficios dichos con amabilidad. */
export const TEXTOS_BENEFICIOS = {
  titulo: 'Qué bueno que llegaste',
  beneficios: [
    'Explicaciones a tu ritmo, con ejemplos y fuentes confiables.',
    'Un plan de estudio pensado para tu punto de partida.',
    `${tutor} te acompaña paso a paso hasta que la respuesta aparezca.`,
  ],
} as const;

export const TEXTOS_ACOMPANAMIENTO = `${tutor} está contigo en cada paso.`;

export const ENLACES_NAVEGACION = [
  { ruta: '/tema', texto: 'Tema' },
  { ruta: '/tutor', texto: 'Tutor' },
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
  sesionCerrada: 'Cerraste sesión. ¡Vuelve pronto!',
  pie: {
    cumplimiento: 'Cumplimiento y uso de IA',
    politica: 'Política de datos',
    privacidad: 'Mis datos y privacidad',
  },
} as const;
