import { environment } from '../../../environments/environment';
import { LEMA_SECUNDARIO } from '../../layout/textos-layout';

const tutor = environment.tutorNombre;

export const TEXTOS_LOGIN = {
  titulo: 'Ingresa a TutorIA',
  subtitulo: LEMA_SECUNDARIO,
  correo: 'Correo electrónico',
  contrasena: 'Contraseña',
  boton: 'Ingresar',
  sinCuenta: '¿Aún no tienes cuenta?',
  registro: 'Crea tu cuenta',
} as const;

export const TEXTOS_REGISTRO = {
  titulo: 'Crea tu cuenta',
  subtitulo: 'Estudia a tu ritmo con un tutor que te enseña, no que te hace la tarea.',
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
  menorTitulo: 'Como eres menor de edad, un adulto responsable debe autorizar tu cuenta',
  menorTemprano: [
    'Guardamos tu nombre, tu correo, tu fecha de nacimiento y lo que estudias en TutorIA.',
    `Lo usamos solo para ayudarte a aprender. ${tutor} es una inteligencia artificial y puede equivocarse.`,
    'Tu mamá, papá o representante legal recibirá un correo para dar su permiso. Hasta entonces no podrás usar la app.',
  ],
  menorAdolescente: [
    'Guardamos tu nombre, correo, fecha de nacimiento, nivel educativo y tus sesiones de estudio.',
    `Los usamos para tus planes y las respuestas de ${tutor}; nunca para publicidad ni se venden.`,
    'Tu madre, padre o representante legal debe autorizar la cuenta desde un enlace que le llegará al correo. Puede revocarla cuando quiera.',
  ],
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
  explicacion:
    'Como eres menor de edad, la ley pide que tu madre, padre o representante legal autorice tu cuenta antes de que empieces.',
  pasos: [
    'Comparte con el adulto responsable el enlace de autorización.',
    'Él o ella escribe su correo y el tuyo. Le enviaremos un correo para que confirme.',
    'Cuando confirme, vuelve aquí y pulsa "Ya fue autorizada, revisar".',
  ],
  avisoCorreo:
    'Si el adulto ya registró su correo, enviamos un mensaje para confirmar la autorización. Pídele que revise también la carpeta de spam.',
  enlaceTitulo: 'Enlace para el adulto responsable',
  copiar: 'Copiar enlace',
  copiado: 'Enlace copiado.',
  abrir: 'Abrir la autorización en este dispositivo',
  revisar: 'Ya fue autorizada, revisar',
  sigue:
    'Tu cuenta sigue pendiente de autorización. Si el adulto ya confirmó, espera un momento e intenta de nuevo.',
  activa: '¡Tu cuenta ya está autorizada! Bienvenido a TutorIA.',
  cerrarSesion: 'Cerrar sesión',
} as const;
