import { Page, expect, test } from '@playwright/test';
import { simularApi } from './api-simulada';

/**
 * Una pregunta, un título o una instrucción se ve una sola vez por pantalla. Se revisan los
 * textos visibles de títulos, leyendas, etiquetas y párrafos (no los ocultos para lectores).
 */
async function textosRepetidos(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const visible = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      const estilo = getComputedStyle(el);
      return (
        r.width > 1 &&
        r.height > 1 &&
        estilo.visibility !== 'hidden' &&
        !el.closest('.visualmente-oculto, [aria-hidden="true"]')
      );
    };
    const vistos = new Map<string, number>();
    for (const el of document.querySelectorAll<HTMLElement>(
      'h1, h2, h3, h4, legend, label, p, [role="heading"]',
    )) {
      if (!visible(el)) {
        continue;
      }
      const texto = (el.innerText ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (texto.length < 4) {
        continue;
      }
      vistos.set(texto, (vistos.get(texto) ?? 0) + 1);
    }
    return [...vistos].filter(([, veces]) => veces > 1).map(([texto]) => texto);
  });
}

async function vecesVisible(page: Page, texto: string): Promise<number> {
  return page.evaluate((buscado) => document.body.innerText.split(buscado).length - 1, texto);
}

test.describe('sin textos repetidos', () => {
  test('ingreso', async ({ page }) => {
    await simularApi(page, { conSesion: false });
    await page.goto('/login');
    await expect(page.locator('h1')).toBeVisible();
    expect(await textosRepetidos(page)).toEqual([]);
  });

  test('registro de una persona adulta y de un menor', async ({ page }) => {
    await simularApi(page, { conSesion: false });
    await page.goto('/registro');
    await expect(page.locator('#registro-tratamiento')).toBeVisible();
    expect(await textosRepetidos(page)).toEqual([]);
    expect(await vecesVisible(page, '¿Dónde estudias?')).toBe(1);

    await page.locator('#registro-fecha').fill('2011-03-01');
    await expect(page.locator('#registro-correo-acudiente')).toBeVisible();
    expect(await textosRepetidos(page)).toEqual([]);
  });

  test('configuración del nivel educativo (perfil) y del tema', async ({ page }) => {
    await simularApi(page, { conSesion: true });
    await page.goto('/perfil');
    await expect(page.locator('h1')).toBeVisible();
    expect(await textosRepetidos(page)).toEqual([]);
    expect(await vecesVisible(page, '¿Dónde estudias?')).toBe(1);

    await page.goto('/tema');
    await expect(page.locator('h1')).toBeVisible();
    expect(await textosRepetidos(page)).toEqual([]);
  });
});
