import { environment } from '../../../environments/environment';

const tutor = environment.tutorNombre;

export const TEXTOS_LOGIN = {
  titulo: 'Ingresa a TutorIA',
  subtitulo: 'Qué bueno verte de nuevo.',
  correo: 'Correo electrónico',
  contrasena: 'Contraseña',
  boton: 'Ingresar',
  sinCuenta: '¿Aún no tienes cuenta?',
  registro: 'Crea tu cuenta',
} as const;

export const TEXTOS_REGISTRO = {
  titulo: 'Crea tu cuenta',
  datosPersonales: 'Tus datos',
  nombre: 'Nombre',
  correo: 'Correo electrónico',
  contrasena: 'Contraseña',
  ayudaContrasena: 'De 8 a 64 caracteres, con letras y números.',
  fechaNacimiento: 'Fecha de nacimiento',
  ayudaFecha: 'TutorIA está disponible a partir de los 13 años.',
  tipoNivel: '¿Dónde estudias?',
  colegio: 'Colegio',
  universidad: 'Universidad o técnica',
  nivelEducativo: 'Nivel educativo',
  eligeNivel: 'Elige una opción',
  eligeTipoPrimero: 'Primero elige dónde estudias',
  datosTitulo: 'Tus datos y tu privacidad',
  resumenDatos: [
    'Se piden nombre, correo, fecha de nacimiento y nivel educativo. Nunca datos sensibles.',
    'No escribas en el chat datos personales de otras personas.',
    `Tus datos sirven para crear tu cuenta, armar tus planes de estudio y que ${tutor} te responda.`,
    'Puedes ver, corregir, descargar o eliminar tus datos cuando quieras en "Mis datos y privacidad".',
  ],
  autorizaciones: 'Autorizaciones',
  verPolitica: 'Leer la política de tratamiento de datos',
  version: 'Versión de la política',
  personalizacionDetalle: 'Puedes desactivarlo en cualquier momento.',
  menorTitulo:
    'Como eres menor de edad, necesitas la autorización de un adulto responsable. Le llegará un correo para que la apruebe.',
  menorTemprano: [
    'TutorIA guarda tu nombre, tu correo, tu fecha de nacimiento y lo que estudias.',
    `Se usa solo para ayudarte a aprender. ${tutor} es una inteligencia artificial y puede equivocarse.`,
    'Hasta que tu adulto responsable dé su permiso no podrás usar la app.',
  ],
  menorAdolescente: [
    'TutorIA guarda tu nombre, correo, fecha de nacimiento, nivel educativo y tus sesiones de estudio.',
    `Se usan para tus planes y las respuestas de ${tutor}; nunca para publicidad ni se venden.`,
    'Tu adulto responsable puede retirar la autorización cuando quiera.',
  ],
  correoAcudiente: 'Correo del adulto responsable',
  ayudaCorreoAcudiente: 'Mamá, papá, acudiente o representante legal',
  boton: 'Crear mi cuenta',
  botonDeshabilitado: 'Marca las dos autorizaciones obligatorias para continuar.',
  yaTienesCuenta: '¿Ya tienes cuenta?',
  ingresar: 'Ingresa',
  politicaNoCargo:
    'No pudimos cargar la política de tratamiento de datos. Sin ella no puedes registrarte.',
  reintentar: 'Reintentar',
  politicaActualizada:
    'La política de datos se acaba de actualizar. Revisa los textos y vuelve a marcar las autorizaciones.',
} as const;

export const TEXTOS_PENDIENTE = {
  titulo: 'Tu cuenta está casi lista',
  cargando: 'Revisando tu autorización…',
  error: 'Algo no salió como esperaba. Intentémoslo de nuevo.',
  reintentar: 'Reintentar',
  pendiente: (correo: string) =>
    `Se envió un correo a ${correo}. Cuando tu adulto responsable lo apruebe, podrás empezar a usar TutorIA.`,
  pendienteSinCorreo:
    'Se envió un correo a tu adulto responsable. Cuando lo apruebe, podrás empezar a usar TutorIA.',
  spam: 'Si no lo encuentra, pídele que revise también la carpeta de spam.',
  sinSolicitud:
    'La solicitud aún no se ha enviado. Escribe el correo de tu adulto responsable para que la apruebe.',
  rechazada:
    'Tu adulto responsable no autorizó la cuenta por ahora. Si fue un error, puedes pedirlo a otra persona.',
  expirada: 'El enlace del correo ya venció. Puedes reenviar el correo o escribir otro.',
  revocada:
    'Tu adulto responsable retiró la autorización. Puedes pedirla de nuevo o escribir otro correo.',
  revisar: 'Ya lo autorizó, revisar',
  reenviar: 'Reenviar correo',
  podrasReenviar: (tiempo: string) => `Podrás reenviar en ${tiempo}`,
  otroCorreo: 'Usar otro correo',
  cancelarOtro: 'Cancelar',
  correoNuevo: 'Correo del adulto responsable',
  ayudaCorreoNuevo: 'Mamá, papá, acudiente o representante legal',
  enviarNuevo: 'Enviar a este correo',
  reenviado: 'Listo, el correo se envió de nuevo.',
  demasiadas: 'Ya se enviaron varios correos. Espera un momento antes de intentarlo otra vez.',
  sinRespuesta: 'Aún no hay respuesta de tu adulto responsable. Te avisamos aquí apenas la dé.',
  activa: '¡Listo, tu adulto responsable te autorizó!',
  cerrarSesion: 'Cerrar sesión',
} as const;

export const TEXTOS_VERIFICA_CORREO = {
  titulo: 'Confirma tu correo para empezar',
  cargando: 'Revisando tu correo…',
  enviado: (correo: string) =>
    `Te enviamos un mensaje a ${correo}. Ábrelo y pulsa «Confirmar mi correo».`,
  neutro: 'No pudimos completar esto. Intenta de nuevo en unos minutos.',
  reintentar: 'Reintentar',
  revisar: 'Ya lo confirmé, revisar',
  reenviar: 'Reenviar correo',
  podrasReenviar: (tiempo: string) => `Podrás pedir otro en ${tiempo}`,
  reenviado: 'Listo, te enviamos otro correo.',
  demasiadas: 'Ya pediste varios correos. Espera un momento antes de pedir otro.',
  spam: '¿No lo ves? Revisa la carpeta de spam.',
  sinConfirmar: 'Todavía no vemos tu correo confirmado. Revisa el mensaje y pulsa el botón.',
  confirmado: '¡Listo! Confirmamos tu correo.',
  cerrarSesion: 'Cerrar sesión',
  pasos: 'Pasos para activar tu cuenta',
  pasoCorreo: 'Confirmar tu correo',
  pasoAutorizacion: 'Autorización de tu adulto responsable',
  pasoActual: 'Ahora',
  estadoAutorizacion: {
    SIN_SOLICITUD: 'Sin enviar',
    PENDIENTE: 'Esperando respuesta',
    AUTORIZADA: 'Autorizada',
    RECHAZADA: 'No autorizada',
    REVOCADA: 'Retirada',
    EXPIRADA: 'Enlace vencido',
  } as Partial<Record<string, string>>,
} as const;

export const TEXTOS_VERIFICAR_ENLACE = {
  titulo: 'Confirmación de correo',
  cargando: 'Confirmando tu correo…',
  listo: '¡Listo! Confirmamos tu correo.',
  continuar: 'Continuar',
  ingresar: 'Ingresar',
  invalido: 'Este enlace ya no es válido. Ingresa a TutorIA y pide uno nuevo.',
  neutro: 'No pudimos completar esto. Intenta de nuevo en unos minutos.',
  reintentar: 'Reintentar',
} as const;
