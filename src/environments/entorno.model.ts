export interface Entorno {
  readonly produccion: boolean;
  /** Ruta de la API. Relativa en desarrollo (proxy) y absoluta en AWS (`https://api.<dominio>/api/v1`). */
  readonly apiBaseUrl: string;
  /** Nombre visible del tutor conversacional. */
  readonly tutorNombre: string;
  /** Precio solo informativo: el backend es la fuente de verdad. */
  readonly precioPremiumAnualCop: number;
}
