import { environment } from '../../../environments/environment';
import { PlanSuscripcion } from '../../core/models';

const tutor = environment.tutorNombre;

/**
 * Descripción comercial para mostrar (espejo de la configuración del backend). Los límites reales
 * y lo que cada plan permite los decide SIEMPRE el backend.
 */
export const PLANES: readonly {
  id: PlanSuscripcion;
  nombre: string;
  precio: string | null;
  incluye: readonly string[];
}[] = [
  {
    id: 'GRATUITO',
    nombre: 'Gratis',
    precio: null,
    incluye: [
      'Diagnóstico y plan de estudio personalizado',
      `Chat con ${tutor}: 20 mensajes al día`,
      'Hasta 5 planes nuevos al día',
      '2 ilustraciones con IA y 5 búsquedas de video al día',
      '3 archivos al día en el nivel Avanzado',
      'Un tema a la vez con el tutor',
      'Historial reciente',
    ],
  },
  {
    id: 'PREMIUM',
    nombre: 'Premium',
    precio: 'anual',
    incluye: [
      'Todo lo del plan Gratis',
      `Chat con ${tutor}: 200 mensajes al día`,
      'Hasta 50 planes nuevos al día',
      '10 ilustraciones con IA y 30 búsquedas de video al día',
      '20 archivos al día en el nivel Avanzado',
      'Varios temas a la vez con el tutor',
      'Historial completo',
      'Reporte de progreso descargable',
    ],
  },
];

export const TEXTOS_PLANES = {
  titulo: 'Planes',
  intro:
    'Empieza gratis. Si quieres estudiar más temas a la vez y llevar tu progreso, mejora a Premium.',
  tuPlan: 'Tu plan actual',
  porAnio: 'al año',
  gratis: '$0',
  mejorar: 'Mejorar a Premium',
  redirigiendo: 'Te estamos llevando a la pasarela de pago…',
  yaPremium: 'Ya tienes Premium. ¡Gracias por apoyar TutorIA!',
  vence: 'Vigente hasta',
  pagoSeguro:
    'El pago se hace en una pasarela externa segura. TutorIA no ve ni guarda los datos de tu tarjeta.',
  urlInvalida: 'No pudimos abrir la pasarela de pago. Inténtalo de nuevo.',
} as const;
