import { environment } from '../../../environments/environment';

const tutor = environment.tutorNombre;

export const TEXTOS_POLITICA = {
  titulo: 'Política de tratamiento de datos',
  intro: 'Así cuidamos tus datos personales, conforme a la Ley 1581 de 2012.',
  version: 'Versión',
  vigente: 'Vigente desde',
  responsable: 'Responsable del tratamiento',
  nit: 'NIT',
  domicilio: 'Domicilio',
  contacto: 'Correo para ejercer tus derechos',
  finalidades: 'Autorizaciones que te pedimos',
  obligatoria: 'Obligatoria',
  opcional: 'Opcional',
  error: 'No pudimos cargar la política en este momento.',
  reintentar: 'Reintentar',
} as const;

/** Texto fijo de la pantalla de cumplimiento; los datos variables llegan de GET /cumplimiento. */
export const TEXTOS_CUMPLIMIENTO = {
  titulo: 'Cumplimiento y uso de IA',
  intro: [
    `TutorIA usa inteligencia artificial para generar diagnósticos, planes de estudio y las respuestas de ${tutor}. ${tutor} es una IA, no una persona, y puede equivocarse: contrasta siempre con las fuentes y con tu profesor.`,
    'TutorIA enseña, no resuelve tareas. Solo atiende temas de estudio.',
  ],
  proveedores: 'Qué IA usamos y qué datos recibe cada proveedor',
  datosEnviados: 'Datos que recibe',
  finalidad: 'Para qué',
  edad: 'Edad mínima',
  edadTexto: (edad: number) =>
    `TutorIA está disponible a partir de los ${edad} años. Los menores de 18 necesitan la autorización de un adulto responsable.`,
  retencion: 'Cuánto tiempo guardamos los datos',
  dias: (dias: number) => `${dias} ${dias === 1 ? 'día' : 'días'}`,
  contacto: 'Contacto',
  politica: 'Leer la política de tratamiento de datos',
  error: 'No pudimos cargar la información de cumplimiento en este momento.',
  reintentar: 'Reintentar',
} as const;

/** Nombre legible de cada clave de retención que envía el backend. */
export const NOMBRE_RETENCION: Readonly<Record<string, string>> = {
  conversaciones: `Conversaciones con ${tutor}`,
  archivos: 'Archivos entregados',
  planes: 'Planes de estudio',
  diagnosticos: 'Diagnósticos',
  cuenta_inactiva: 'Cuenta sin uso',
  registros: 'Registros de seguridad',
};
