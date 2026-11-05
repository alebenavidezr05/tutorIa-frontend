import { environment } from '../../../environments/environment';
import { EstadoActividad } from '../../core/models';

const tutor = environment.tutorNombre;

export const TEXTOS_PLAN = {
  cargando: 'Estoy trayendo tu plan…',
  error: 'Algo no salió como esperaba. Intentémoslo de nuevo.',
  reintentar: 'Reintentar',
  completado: '¡Completaste todas las actividades! Buen trabajo.',
  noValidado:
    'Este plan no pasó toda nuestra verificación. Úsalo como guía y consulta con tu profesor.',
  explicacion: 'La idea clave',
  tecnicas: 'Técnicas de estudio',
  actividades: 'Actividades',
  actividadesAyuda: 'Escribe tu respuesta con tus palabras. Se guarda sola cuando sales del campo.',
  avanzadoAyuda:
    'En el nivel Avanzado también puedes entregar tu explicación o resumen como archivo.',
  fuentes: 'Fuentes del plan',
  sinFuentes: 'Este plan no cita fuentes.',
  preguntarTutor: `Preguntarle a ${tutor}`,
  abriendoTutor: `Abriendo el chat con ${tutor}…`,
  progreso: (hechas: number, total: number) => `${hechas} de ${total} actividades completadas`,
} as const;

export const TEXTOS_ACTIVIDAD = {
  actividad: (n: number) => `Actividad ${n}`,
  respuesta: 'Tu respuesta',
  guardando: 'Guardando…',
  guardado: 'Guardado',
  errorGuardar: 'No se pudo guardar. Sal del campo de nuevo para reintentar.',
  completar: 'Marcar como completada',
  omitir: 'Omitir',
  reabrir: 'Volver a pendiente',
  archivoEntregado: 'Archivo entregado',
  verArchivo: 'Ver archivo',
  quitarArchivo: 'Quitar archivo',
  subirDeNuevo: 'Intentar subir de nuevo',
  sinCupoArchivos: 'Llegaste al límite de archivos de hoy',
} as const;

export const ESTADO_ACTIVIDAD: Record<EstadoActividad, string> = {
  PENDIENTE: 'Pendiente',
  COMPLETADA: 'Completada',
  OMITIDA: 'Omitida',
};
