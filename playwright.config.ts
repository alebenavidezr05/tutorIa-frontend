import { defineConfig, devices } from '@playwright/test';

/**
 * Pruebas e2e responsive (320, 375, 768 y 1280 px). La API se simula con `page.route`,
 * así que no hace falta el backend. Uso: `npm run e2e`.
 */
const PUERTO = 4300;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: [['list']],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    locale: 'es-CO',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'movil-320',
      use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 640 }, hasTouch: true },
    },
    {
      name: 'movil-375',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 667 }, hasTouch: true },
    },
    {
      name: 'tableta-768',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'escritorio-1280',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    command: `node node_modules/@angular/cli/bin/ng.js serve --port ${PUERTO}`,
    url: `http://localhost:${PUERTO}`,
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
