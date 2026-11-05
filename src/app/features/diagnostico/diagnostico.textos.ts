import { PASOS_COMO_FUNCIONA } from '../../layout/textos-layout';

export const TEXTOS_TEMA = {
  titulo: '¿Qué te gustaría aprender hoy?',
  saludo: (nombre: string) => (nombre ? `¡Hola, ${nombre}!` : '¡Hola!'),
  etiqueta: 'Escribe un tema de estudio',
  ejemplosTitulo: 'Ideas para empezar:',
  ejemplos: [
    'Fracciones equivalentes',
    'La fotosíntesis',
    'Leyes de Newton',
    'La Independencia de Colombia',
    'Derivadas',
  ],
  boton: 'Empezar el diagnóstico',
  creando: 'Preparando tu diagnóstico…',
} as const;

/** Bloque «¿Cómo funciona?» de /tema. Los niveles usan las descripciones de `NIVELES`. */
export const TEXTOS_COMO_FUNCIONA = {
  titulo: '¿Cómo funciona?',
  pasos: PASOS_COMO_FUNCIONA,
  nivelesTitulo: 'Niveles del diagnóstico',
  noEsExamen: 'No es un examen: Vex solo necesita saber dónde estás para armar tu plan.',
} as const;

export const TEXTOS_CUESTIONARIO = {
  titulo: 'Diagnóstico',
  progreso: (actual: number, total: number) => `Pregunta ${actual} de ${total}`,
  anterior: 'Anterior',
  siguiente: 'Siguiente',
  enviar: 'Ver mi resultado',
  eligeUna: 'Elige una respuesta para continuar.',
  animo: 'Tómate tu tiempo. Así conozco tu punto de partida.',
  cargando: 'Estoy preparando tus preguntas…',
  enviando: 'Revisando tus respuestas…',
  error: 'Algo no salió como esperaba. Intentémoslo de nuevo.',
  volver: 'Elegir otro tema',
} as const;

export const TEXTOS_RESULTADO = {
  titulo: '¡Terminaste el diagnóstico!',
  aciertos: (aciertos: number, total: number) => `Acertaste ${aciertos} de ${total} preguntas.`,
  revision: 'Revisa tus respuestas',
  tuRespuesta: 'Tu respuesta',
  correcta: 'Correcta',
  incorrecta: 'Incorrecta',
  respuestaCorrecta: 'Respuesta correcta',
  fuente: 'Fuente',
  generar: 'Generar mi plan',
  generando: 'Estoy pensando en tu plan…',
  noEncontrado: 'Este resultado no está disponible',
  noEncontradoTexto:
    'Puede que hayas recargado la página. Tus planes guardados están en el historial.',
  historial: 'Ir al historial',
  nuevoTema: 'Estudiar otro tema',
} as const;
