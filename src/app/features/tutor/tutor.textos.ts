import { environment } from '../../../environments/environment';
import { CategoriaReporte, EstadoConversacion, MotivoFeedback } from '../../core/models';

export const TUTOR = environment.tutorNombre;

export const TEXTOS_TUTOR = {
  titulo: TUTOR,
  intro: `Tu tutor de estudio. ${TUTOR} te explica paso a paso, con ejemplos y fuentes, pero no te hace la tarea.`,
  nueva: 'Nueva conversación',
  nuevaTitulo: '¿Sobre qué quieres conversar?',
  tema: 'Tema de estudio',
  ayudaTema: 'Por ejemplo: "ecuaciones de primer grado" o "el ciclo del agua".',
  empezar: 'Empezar a conversar',
  lista: 'Tus conversaciones',
  vacioTitulo: 'Aún no has conversado con el tutor',
  vacioTexto: `Escribe un tema y ${TUTOR} te ayudará a entenderlo a tu ritmo.`,
  abrir: 'Abrir',
  borrar: 'Borrar',
  borrarTitulo: '¿Borrar esta conversación?',
  borrarTexto: 'Se borrarán todos sus mensajes y archivos. Esta acción no se puede deshacer.',
  borrada: 'Conversación borrada.',
  ultimoMensaje: 'Último mensaje',
  cargarMas: 'Ver más conversaciones',
  error: 'No pudimos cargar tus conversaciones.',
  reintentar: 'Reintentar',
} as const;

export const ESTADO_CONVERSACION: Record<EstadoConversacion, string> = {
  ABIERTA: 'Abierta',
  CERRADA: 'Terminada',
};

export const TEXTOS_CHAT = {
  avisoIa: `${TUTOR} es una inteligencia artificial, no una persona. Puede equivocarse: contrasta con las fuentes y con tu profesor.`,
  terminar: 'Terminar sesión',
  terminando: 'Preparando tu resumen…',
  pensando: `${TUTOR} está pensando…`,
  demorado: 'Esto está tardando un poco, sigo trabajando en tu respuesta.',
  respondio: `${TUTOR} respondió.`,
  tu: 'Tú',
  cargando: 'Cargando la conversación…',
  errorCarga: 'No pudimos abrir esta conversación.',
  reintentar: 'Reintentar',
  errorEnvio: 'No pudimos enviar tu mensaje. Lo que escribiste sigue aquí.',
  cerrada: 'Esta sesión terminó. Puedes leerla y revisar sus referencias.',
  cerradaAlEnviar: 'Esta conversación ya fue cerrada. Puedes abrir una nueva sobre el mismo tema.',
  nueva: 'Nueva conversación',
  referencias: 'Referencias (APA 7)',
  sinReferencias: 'Esta conversación no tiene referencias.',
  verResumen: 'Ver resumen de la sesión',
  archivoAdjunto: (nombre: string) => `Archivo adjunto: ${nombre}`,
  sinVerificar: 'Esta respuesta no pasó toda la verificación. Contrástala con las fuentes.',
  mensajeSistema: 'Mensaje de TutorIA',
  respuestaNoAcademica: 'Solo puedo ayudarte con temas de estudio. Cuéntame qué quieres aprender.',
  volver: 'Volver a mis conversaciones',
} as const;

export const TEXTOS_CAMPO = {
  etiqueta: `Escribe tu mensaje para ${TUTOR}`,
  ayuda: 'Enter para enviar · Shift + Enter para un salto de línea',
  enviar: 'Enviar',
  contador: (n: number, max: number) => `${n} de ${max} caracteres`,
  respondiendo: 'Respondiendo a:',
  quitarContexto: 'Quitar',
  adjuntar: 'Adjuntar',
} as const;

export const TEXTOS_BLOQUES = {
  fuentes: (n: number) => `Fuentes (${n})`,
  ocultarFuentes: 'Ocultar fuentes',
  ejemplo: 'Ejemplo',
  analogia: 'Piénsalo así',
  pregunta: 'Para pensar',
  formula: 'Fórmula',
  resumenTitulo: 'Cuéntame con tus palabras qué entendiste del video',
  responder: 'Responder con mis palabras',
  prefijoResumen: 'Mi resumen del video: ',
  video: {
    ver: 'Ver video',
    privacidad: 'El video lo aloja YouTube. Al reproducirlo, YouTube recibe datos de tu navegador.',
    abrir: 'Abrir en YouTube',
    canal: 'Canal',
    duracion: 'Duración',
    atribucion: 'Video de YouTube',
    noVerificado: 'Sugerido, no revisado por TutorIA',
  },
} as const;

export const TEXTOS_VISUAL = {
  preparando: 'Preparando una imagen…',
  ilustracionIa: 'Ilustración generada por IA',
  autor: 'Autor',
  licencia: 'Licencia',
  proveedor: 'Fuente',
  origen: 'Ver origen',
  sinAutor: 'Autor no indicado',
  diagramaComoTexto: 'Ver el diagrama como texto',
  sinConexiones: 'sin conexiones',
} as const;

export const TEXTOS_FEEDBACK = {
  pregunta: '¿Te sirvió esta respuesta?',
  si: 'Me sirvió',
  no: 'No me sirvió',
  motivo: '¿Qué podemos mejorar? (opcional)',
  enviarMotivo: 'Enviar motivo',
  gracias: '¡Gracias por contarnos!',
  mas: 'Más acciones',
  menos: 'Ocultar acciones',
} as const;

export const MOTIVOS_FEEDBACK: readonly { valor: MotivoFeedback; etiqueta: string }[] = [
  { valor: 'NO_ENTENDI', etiqueta: 'No lo entendí' },
  { valor: 'MUY_LARGO', etiqueta: 'Muy larga' },
  { valor: 'MUY_CORTO', etiqueta: 'Muy corta' },
  { valor: 'MUY_FACIL', etiqueta: 'Muy fácil' },
  { valor: 'MUY_DIFICIL', etiqueta: 'Muy difícil' },
  { valor: 'OTRO', etiqueta: 'Otro motivo' },
];

export const TEXTOS_REPORTE = {
  boton: 'Reportar',
  titulo: 'Reportar esta respuesta',
  categoria: '¿Qué pasó?',
  comentario: 'Cuéntanos más (opcional)',
  enviar: 'Enviar reporte',
  reportado: 'Reportado. Gracias, lo revisaremos.',
} as const;

export const CATEGORIAS_REPORTE: readonly { valor: CategoriaReporte; etiqueta: string }[] = [
  { valor: 'CONTENIDO_INCORRECTO', etiqueta: 'La información es incorrecta' },
  { valor: 'NO_ACADEMICO_REITERADO', etiqueta: 'No es un tema de estudio' },
  { valor: 'ACOSO', etiqueta: 'Contenido ofensivo o acoso' },
  { valor: 'VIOLENCIA', etiqueta: 'Violencia' },
  { valor: 'SEXUAL', etiqueta: 'Contenido sexual' },
  { valor: 'AUTOLESION', etiqueta: 'Autolesión' },
  { valor: 'ILICITO', etiqueta: 'Algo ilegal' },
  { valor: 'OTRO', etiqueta: 'Otro' },
];

export const TEXTOS_RESUMEN = {
  titulo: 'Resumen de la sesión',
  resumen: 'Lo que trabajamos',
  referencias: 'Referencias (APA 7)',
  copiar: 'Copiar referencias',
  copiadas: 'Copiamos las referencias.',
  noCopiadas: 'Tu navegador no permitió copiar. Selecciona el texto y cópialo.',
  sinResumen: 'El resumen ya no está disponible, pero estas son las referencias de la sesión.',
  sinReferencias: 'Esta sesión no tiene referencias.',
  volver: 'Volver a mis conversaciones',
  nueva: 'Nueva conversación',
} as const;
