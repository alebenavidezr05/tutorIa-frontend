import { defineConfig } from 'vitest/config';

// Configuración adicional del runner de Angular (`runnerConfig` en angular.json).
// `threads` evita cierres inesperados de procesos hijos en Windows al terminar la suite.
export default defineConfig({
  test: {
    pool: 'threads',
    teardownTimeout: 10_000,
  },
});
