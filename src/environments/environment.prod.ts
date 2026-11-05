// Archivo regenerado por `npm run build:prod` (scripts/generar-entorno-prod.mjs) a partir de
// la variable de CI API_BASE_URL. Sin la variable se usa '/api/v1' (mismo origen, Docker + Caddy).
import { Entorno } from './entorno.model';

export const environment: Entorno = {
  produccion: true,
  apiBaseUrl: '/api/v1',
  tutorNombre: 'Vex',
  precioPremiumAnualCop: 130000,
};
