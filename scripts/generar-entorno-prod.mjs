// Genera src/environments/environment.prod.ts con la URL de la API inyectada por CI.
// Uso: API_BASE_URL=https://api.midominio.co/api/v1 npm run build:prod
import { writeFileSync } from 'node:fs';

const apiBaseUrl = process.env.API_BASE_URL ?? '/api/v1';
const tutorNombre = process.env.TUTOR_NOMBRE ?? 'Vex';
const precio = Number(process.env.PRECIO_PREMIUM_ANUAL_COP ?? '130000');

if (!/^(\/|https:\/\/)[^\s'"`]*$/.test(apiBaseUrl)) {
  console.error(`API_BASE_URL no es válida: ${apiBaseUrl} (usa una ruta "/..." o una URL https://)`);
  process.exit(1);
}
if (!/^[\p{L} ]{1,30}$/u.test(tutorNombre) || !Number.isFinite(precio)) {
  console.error('TUTOR_NOMBRE o PRECIO_PREMIUM_ANUAL_COP no son válidos.');
  process.exit(1);
}

const contenido = `// Archivo regenerado por \`npm run build:prod\` (scripts/generar-entorno-prod.mjs) a partir de
// la variable de CI API_BASE_URL. Sin la variable se usa '/api/v1' (mismo origen, Docker + Caddy).
import { Entorno } from './entorno.model';

export const environment: Entorno = {
  produccion: true,
  apiBaseUrl: '${apiBaseUrl}',
  tutorNombre: '${tutorNombre}',
  precioPremiumAnualCop: ${precio},
};
`;
writeFileSync(new URL('../src/environments/environment.prod.ts', import.meta.url), contenido);
console.log(`environment.prod.ts → apiBaseUrl = ${apiBaseUrl}`);
