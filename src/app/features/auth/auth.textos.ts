import { environment } from '../../../environments/environment';

const tutor = environment.tutorNombre;

export const TEXTOS_LOGIN = {
  titulo: 'Ingresa a TutorIA',
  subtitulo: 'Qué bueno verte. Sigamos aprendiendo juntos.',
  correo: 'Correo electrónico',
  contrasena: 'Contraseña',
  boton: 'Ingresar',
  sinCuenta: '¿Aún no tienes cuenta?',
  registro: 'Crea tu cuenta',
} as const;

export const TEXTOS_REGISTRO = {
  titulo: 'Crea tu cuenta',
  subtitulo: `Estudia a tu ritmo: ${tutor} te guía paso a paso hasta que la respuesta aparezca.`,
  nombre: 'Nombre',
  correo: 'Correo electrónico',
  contrasena: 'Contraseña',
  ayudaContrasena: 'Entre 8 y 64 caracteres, con al menos una letra y un número.',
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
    'Te pedimos nombre, correo, fecha de nacimiento y nivel educativo. No pedimos datos sensibles.',
    'No escribas en el chat datos personales de otras personas.',
    `Usamos tus datos para crear tu cuenta, armar tus planes de estudio y que ${tutor} te responda.`,
    'Puedes ver, corregir, descargar o eliminar tus datos cuando quieras en "Mis datos y privacidad".',
  ],
  verPolitica: 'Leer la política de tratamiento de datos',
  version: 'Versión de la política',
  personalizacionDetalle: `Si lo activas, ${tutor} recordará cómo prefieres que te expliquen. Puedes desactivarlo en cualquier momento.`,
  menorTitulo:
    'Como eres menor de edad, necesitamos la autorización de un adulto responsable. Le enviaremos un correo para que la apruebe.',
  menorTemprano: [
    'Guardamos tu nombre, tu correo, tu fecha de nacimiento y lo que estudias en TutorIA.',
    `Lo usamos solo para ayudarte a aprender. ${tutor} es una inteligencia artificial y puede equivocarse.`,
    'Hasta que tu adulto responsable dé su permiso no podrás usar la app.',
  ],
  menorAdolescente: [
    'Guardamos tu nombre, correo, fecha de nacimiento, nivel educativo y tus sesiones de estudio.',
    `Los usamos para tus planes y las respuestas de ${tutor}; nunca para publicidad ni se venden.`,
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
    `Le enviamos un correo a ${correo}. Cuando tu adulto responsable lo apruebe, podrás empezar a usar TutorIA.`,
  pendienteSinCorreo:
    'Le enviamos un correo a tu adulto responsable. Cuando lo apruebe, podrás empezar a usar TutorIA.',
  spam: 'Si no lo encuentra, pídele que revise también la carpeta de spam.',
  sinSolicitud:
    'Aún no hemos enviado la solicitud. Escribe el correo de tu adulto responsable para que la apruebe.',
  rechazada:
    'Tu adulto responsable no autorizó la cuenta por ahora. Si fue un error, puedes pedirlo a otra persona.',
  expirada: 'El enlace que enviamos ya venció. Puedes reenviar el correo o escribir otro.',
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
  reenviado: 'Listo, enviamos el correo de nuevo.',
  demasiadas: 'Ya enviamos varios correos. Espera un momento antes de intentarlo otra vez.',
  sigue:
    'Tu cuenta sigue pendiente de autorización. Si el adulto ya confirmó, espera un momento e intenta de nuevo.',
  activa: '¡Tu cuenta ya está autorizada! Te damos la bienvenida a TutorIA.',
  cerrarSesion: 'Cerrar sesión',
} as const;
