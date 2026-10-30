import { Page, expect, test } from '@playwright/test';
import { simularApi } from './api-simulada';

/** Selectores de objetivos táctiles que deben medir al menos 44 × 44 px. */
const OBJETIVOS =
  'button:not([disabled]), select, textarea, input:not([type=checkbox]):not([type=radio]):not([type=file]), .enlace-boton, [role=switch], summary';

async function sinDesplazamientoHorizontal(page: Page): Promise<void> {
  const desborde = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(desborde, 'la página no debe desplazarse en horizontal').toBeLessThanOrEqual(0);
}

async function objetivosTactiles(page: Page): Promise<void> {
  const pequenos = await page.evaluate((selector) => {
    return [...document.querySelectorAll<HTMLElement>(selector)]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        const estilo = getComputedStyle(el);
        const visible =
          r.width > 0 &&
          r.height > 0 &&
          estilo.visibility !== 'hidden' &&
          !el.closest('.visualmente-oculto');
        return visible && (r.height < 43.5 || r.width < 43.5);
      })
      .map(
        (el) =>
          `${el.tagName.toLowerCase()}.${el.className} "${(el.textContent ?? '').trim().slice(0, 30)}"`,
      );
  }, OBJETIVOS);
  expect(pequenos, 'objetivos táctiles menores de 44 px').toEqual([]);
}

async function camposDe16px(page: Page): Promise<void> {
  const pequenos = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('input, select, textarea')]
      .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16)
      .map((el) => el.id || el.tagName),
  );
  expect(pequenos, 'campos con fuente menor de 16 px (zoom en iOS)').toEqual([]);
}

async function revisar(page: Page): Promise<void> {
  await sinDesplazamientoHorizontal(page);
  await objetivosTactiles(page);
  await camposDe16px(page);
}

test.describe('pantallas públicas', () => {
  test.beforeEach(({ page }) => simularApi(page, { conSesion: false }));

  for (const ruta of [
    '/login',
    '/registro',
    '/autorizacion',
    '/autorizacion/confirmar',
    '/politica',
    '/no-existe',
  ]) {
    test(`${ruta} se usa bien en este ancho`, async ({ page }) => {
      await page.goto(ruta);
      await expect(page.locator('h1').first()).toBeVisible();
      await revisar(page);
    });
  }

  test('el logo y el theme-color están presentes', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByAltText('TutorIA').first()).toBeVisible();
    await expect(page.locator('meta[name=theme-color]')).toHaveAttribute('content', '#0B1B2E');
  });
});

test.describe('pantallas con sesión', () => {
  test.beforeEach(({ page }) => simularApi(page, { conSesion: true }));

  for (const ruta of ['/tema', '/plan/plan-1', '/tutor', '/historial', '/planes', '/perfil']) {
    test(`${ruta} se usa bien en este ancho`, async ({ page }) => {
      await page.goto(ruta);
      await expect(page.locator('h1').first()).toBeVisible();
      await revisar(page);
    });
  }

  test('chat: aviso de IA, campo de mensaje visible y diagrama/fórmula sin desbordar', async ({
    page,
  }) => {
    await page.goto('/tutor/c-1');
    await expect(
      page.getByRole('note').filter({ hasText: 'inteligencia artificial' }),
    ).toBeVisible();
    await expect(page.locator('app-diagrama-tutor svg')).toBeVisible();
    await revisar(page);

    const campo = page.locator('#campo-mensaje');
    await expect(campo).toBeInViewport();
    await campo.fill('Mi resumen');
    await expect(campo).toBeInViewport();
  });

  test('video: no se carga nada de YouTube antes del clic', async ({ page }) => {
    const externas: string[] = [];
    page.on('request', (req) => {
      if (!req.url().startsWith('http://localhost')) {
        externas.push(req.url());
      }
    });
    await page.goto('/tutor/c-1');
    await expect(page.getByText('Fracciones equivalentes en 5 minutos').first()).toBeVisible();
    expect(externas).toEqual([]);
    await expect(page.locator('iframe')).toHaveCount(0);
  });

  test('menú de navegación accesible con teclado', async ({ page, viewport }) => {
    await page.goto('/tema');
    if ((viewport?.width ?? 0) < 900) {
      const boton = page.getByRole('button', { name: 'Menú' });
      await boton.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(boton).toBeFocused();
      await expect(boton).toHaveAttribute('aria-expanded', 'false');
    } else {
      await expect(page.getByRole('link', { name: 'Historial' })).toBeVisible();
    }
  });
});
