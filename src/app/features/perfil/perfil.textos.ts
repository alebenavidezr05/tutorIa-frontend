import { environment } from '../../../environments/environment';
import { LimitesPublicos, PlanSuscripcion } from '../../core/models';

const tutor = environment.tutorNombre;

export const TEXTOS_PERFIL = {
  titulo: 'Perfil',
  datos: 'Tus datos',
  nombre: 'Nombre',
  correo: 'Correo',
  tipoNivel: '¿Dónde estudias?',
  colegio: 'Colegio',
  universidad: 'Universidad o técnica',
  nivelEducativo: 'Nivel educativo',
  eligeNivel: 'Elige una opción',
  guardar: 'Guardar cambios',
  guardado: 'Tus cambios quedaron guardados.',
  plan: 'Tu plan',
  cupos: 'Te queda hoy',
  verPlanes: 'Ver planes',
  reporte: 'Reporte de progreso',
  reporteTexto: 'Descarga un resumen de tus planes y actividades en formato CSV.',
  descargarReporte: 'Descargar reporte de progreso',
  reporteBloqueado: 'El reporte de progreso es una función de Premium.',
  reporteDescargado: 'Tu reporte de progreso se descargó.',
  aprendizaje: 'Cómo aprendo',
  aprendizajeTexto: `Mira y controla lo que ${tutor} sabe de cómo estudias.`,
  privacidad: 'Mis datos y privacidad',
  cerrarSesion: 'Cerrar sesión',
  desactivar: 'Desactivar mi cuenta',
  desactivarTitulo: '¿Desactivar tu cuenta?',
  desactivarTexto:
    'No podrás volver a ingresar con esta cuenta. Si además quieres que eliminemos tus datos, hazlo desde "Mis datos y privacidad".',
  desactivada: 'Tu cuenta fue desactivada.',
} as const;

export const NOMBRE_PLAN: Record<PlanSuscripcion, string> = {
  GRATUITO: 'Gratis',
  PREMIUM: 'Premium',
};

export const NOMBRE_LIMITE: Record<keyof LimitesPublicos, string> = {
  planes_restantes_hoy: 'Planes nuevos',
  mensajes_restantes_hoy: `Mensajes con ${tutor}`,
  archivos_restantes_hoy: 'Archivos',
  busquedas_video_restantes_hoy: 'Búsquedas de video',
  imagenes_ia_restantes_hoy: 'Ilustraciones con IA',
};

export const TEXTOS_APRENDIZAJE = {
  titulo: 'Cómo aprendo',
  intro: [
    `${tutor} aprende de cada conversación cómo prefieres que te expliquen: con ejemplos, paso a paso, con dibujos…`,
    'Solo guardamos información pedagógica (nunca datos sensibles) y la usamos únicamente para adaptar las respuestas. Tú decides si se usa.',
  ],
  interruptor: 'Personalizar mis respuestas',
  interruptorDescripcion: `Si lo desactivas, ${tutor} responderá de forma general.`,
  desactivada:
    'La personalización está desactivada. No estamos usando ni actualizando lo que sabemos de cómo estudias.',
  resumen: `Lo que ${tutor} ha notado`,
  sinResumen: 'Todavía no tenemos suficientes conversaciones para describir cómo aprendes.',
  interacciones: (n: number) => `Basado en ${n} ${n === 1 ? 'interacción' : 'interacciones'}.`,
  formatos: 'Formatos que más te sirven',
  porcentaje: (etiqueta: string, pct: number) => `${etiqueta}: ${pct} %`,
  detalle: 'Nivel de detalle',
  ritmo: 'Ritmo',
  temas: 'Temas',
  dificultades: 'Te cuesta',
  fortalezas: 'Te va bien',
  ninguna: 'Nada registrado todavía',
  olvidar: `Olvidar lo que ${tutor} sabe de mí`,
  olvidarTitulo: '¿Borrar tu perfil de aprendizaje?',
  olvidarTexto: `Se borrará todo lo que ${tutor} aprendió de cómo estudias. Tus planes y conversaciones no se borran.`,
  olvidarConfirmar: 'Sí, olvidar',
  olvidado: 'Listo. Empezamos de cero.',
  desactivarTitulo: '¿Desactivar la personalización?',
  desactivarTexto: `${tutor} dejará de adaptar sus respuestas a ti. Puedes volver a activarla cuando quieras.`,
  desactivarConfirmar: 'Desactivar',
  conversaciones: `Para borrar conversaciones, ve a tu lista de chats con ${tutor}.`,
  irTutor: 'Ir a mis conversaciones',
  error: 'No pudimos cargar tu perfil de aprendizaje.',
  reintentar: 'Reintentar',
} as const;

export const NOMBRE_DETALLE: Readonly<Record<string, string>> = {
  BREVE: 'Breve',
  MEDIO: 'Medio',
  DETALLADO: 'Detallado',
};

export const NOMBRE_RITMO: Readonly<Record<string, string>> = {
  LENTO: 'Pausado',
  MEDIO: 'Medio',
  RAPIDO: 'Rápido',
};
