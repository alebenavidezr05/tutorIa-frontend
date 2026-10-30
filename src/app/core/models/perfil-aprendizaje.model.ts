export type FormatoExplicacion =
  'EJEMPLO' | 'PASO_A_PASO' | 'VISUAL' | 'ANALOGIA' | 'FORMAL' | 'TEORIA';

export interface FormatoPublico {
  formato: FormatoExplicacion;
  /** 0 a 1 */
  puntaje: number;
  /** 0 a 1 */
  confianza: number;
  etiqueta_legible: string;
}

export interface TemaPublico {
  tema: string;
  dificultades: string[];
  fortalezas: string[];
}

export interface PerfilAprendizajePublico {
  personalizacion_activa: boolean;
  total_interacciones: number;
  resumen: string;
  formatos: FormatoPublico[];
  detalle: string;
  ritmo: string;
  temas: TemaPublico[];
}
