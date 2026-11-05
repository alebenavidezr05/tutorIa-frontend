import { environment } from '../../../environments/environment';
import { EstadoSolicitud, OtorgadoPor, TipoSolicitud } from '../../core/models';

const tutor = environment.tutorNombre;

export const TEXTOS_PRIVACIDAD = {
  titulo: 'Mis datos y privacidad',
  intro:
    'Aquí puedes ver qué datos tuyos guarda TutorIA, cambiar tus autorizaciones, descargar tus datos y pedir que los corrijamos o eliminemos (Ley 1581 de 2012).',
  autorizaciones: {
    titulo: 'Mis autorizaciones',
    otorgada: 'Otorgada',
    noOtorgada: 'No otorgada',
    version: 'Versión de la política',
    fecha: 'Fecha',
    por: 'Otorgada por',
    tratamientoNota:
      'La autorización de tratamiento es necesaria para tener una cuenta. Para retirarla, solicita la eliminación de tu cuenta más abajo.',
    vacio: 'No encontramos autorizaciones registradas.',
  },
  confirmarPersonalizacion: {
    titulo: '¿Desactivar la personalización?',
    texto: `${tutor} dejará de usar lo que sabe de cómo estudias y responderá de forma general. Puedes volver a activarla cuando quieras.`,
    confirmar: 'Desactivar',
  },
  misDatos: {
    titulo: 'Ver mis datos',
    cuenta: 'Cuenta',
    perfil: 'Perfil de aprendizaje',
    contenido: 'Tu contenido en TutorIA',
    descargar: 'Descargar mis datos (JSON)',
    descargado: 'Descargamos una copia de tus datos.',
    error: 'No pudimos cargar tus datos.',
  },
  corregir: {
    titulo: 'Corregir mis datos',
    texto: 'Puedes corregir tu nombre y tu nivel educativo desde tu perfil.',
    enlace: 'Ir a mi perfil',
  },
  solicitudes: {
    titulo: 'Solicitudes',
    texto:
      'Haz una consulta, un reclamo o pide rectificar, suprimir tus datos o revocar tu autorización.',
    tipo: 'Tipo de solicitud',
    detalle: 'Cuéntanos tu solicitud',
    ayudaDetalle: 'Entre 5 y 2000 caracteres. No incluyas datos de otras personas.',
    enviar: 'Enviar solicitud',
    creada: (fecha: string) => `Recibimos tu solicitud. Responderemos antes del ${fecha}.`,
    lista: 'Mis solicitudes',
    vacio: 'Aún no has hecho solicitudes.',
    limite: 'Responderemos antes de',
  },
  eliminar: {
    titulo: 'Eliminar mi cuenta y mis datos',
    texto:
      'Se borrarán tu cuenta, tu perfil de aprendizaje, tus planes, conversaciones y archivos. Conservaremos solo lo que la ley nos obliga a guardar (por ejemplo, la evidencia de tus autorizaciones y de los pagos) durante el tiempo exigido.',
    boton: 'Solicitar la eliminación',
    dialogoTitulo: '¿Eliminar tu cuenta y tus datos?',
    confirmar: 'Sí, solicitar la eliminación',
    detalle: 'Solicito la supresión de mi cuenta y de mis datos personales.',
  },
  enlaces: {
    titulo: 'Más información',
    politica: 'Política de tratamiento de datos',
    contacto: 'Escribir al responsable',
  },
} as const;

export const TIPOS_SOLICITUD: readonly { valor: TipoSolicitud; etiqueta: string }[] = [
  { valor: 'CONSULTA', etiqueta: 'Consulta: quiero saber qué datos tienen y cómo los usan' },
  { valor: 'RECLAMO', etiqueta: 'Reclamo: algo no se está haciendo bien' },
  { valor: 'RECTIFICACION', etiqueta: 'Rectificación: hay datos incorrectos' },
  { valor: 'SUPRESION', etiqueta: 'Supresión: quiero que eliminen mis datos' },
  { valor: 'REVOCATORIA', etiqueta: 'Revocatoria: retiro una autorización' },
];

export const NOMBRE_TIPO_SOLICITUD: Record<TipoSolicitud, string> = {
  CONSULTA: 'Consulta',
  RECLAMO: 'Reclamo',
  RECTIFICACION: 'Rectificación',
  SUPRESION: 'Supresión',
  REVOCATORIA: 'Revocatoria',
};

export const NOMBRE_ESTADO_SOLICITUD: Record<EstadoSolicitud, string> = {
  RECIBIDA: 'Recibida',
  EN_TRAMITE: 'En trámite',
  RESPONDIDA: 'Respondida',
  RECHAZADA: 'Rechazada',
};

export const NOMBRE_OTORGADO_POR: Record<OtorgadoPor, string> = {
  TITULAR: 'Tú',
  REPRESENTANTE_LEGAL: 'Tu representante legal',
};

export const TEXTOS_ACEPTAR_POLITICA = {
  titulo: 'La política de datos se actualizó',
  intro:
    'Para seguir usando TutorIA, lee la nueva versión y marca las autorizaciones obligatorias.',
  version: 'Versión',
  boton: 'Aceptar y continuar',
  aceptada: 'Gracias. Ya puedes seguir estudiando.',
  error: 'No pudimos cargar la política en este momento.',
  reintentar: 'Reintentar',
} as const;
