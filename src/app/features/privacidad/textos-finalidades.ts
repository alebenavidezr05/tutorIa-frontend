import { Finalidad, PoliticaPublica } from '../../core/models';

/** Texto legal de cada finalidad tal como lo envía el backend (nunca escrito a mano). */
export type TextosFinalidad = Partial<Record<Finalidad, string>>;

export function textosFinalidad(politica: PoliticaPublica | null): TextosFinalidad {
  const textos: TextosFinalidad = {};
  for (const finalidad of politica?.finalidades ?? []) {
    textos[finalidad.finalidad] = finalidad.texto;
  }
  return textos;
}

/** Nombres legibles de cada finalidad (rótulos de interfaz, no textos legales). */
export const NOMBRE_FINALIDAD: Record<Finalidad, string> = {
  TRATAMIENTO: 'Tratamiento de datos',
  TRANSFERENCIA_INTERNACIONAL: 'Envío a proveedores de IA fuera de Colombia',
  PERSONALIZACION: 'Personalización del tutor',
  COMUNICACIONES: 'Correos de novedades',
  COMPRAS_MENOR: 'Compras del estudiante',
  OPINION_MENOR: 'Opinión del estudiante',
};
