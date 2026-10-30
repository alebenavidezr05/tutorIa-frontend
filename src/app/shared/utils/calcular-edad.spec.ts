import { calcularEdad, parsearFecha } from './calcular-edad';

describe('calcularEdad', () => {
  const hoy = new Date(2026, 9, 18); // 18 de octubre de 2026

  it('calcula 13 años exactos el día del cumpleaños', () => {
    expect(calcularEdad('2013-10-18', hoy)).toBe(13);
  });

  it('un día antes del cumpleaños número 13 todavía tiene 12', () => {
    expect(calcularEdad('2013-10-19', hoy)).toBe(12);
  });

  it('calcula 17 años', () => {
    expect(calcularEdad('2009-01-01', hoy)).toBe(17);
  });

  it('cumple 18 hoy', () => {
    expect(calcularEdad('2008-10-18', hoy)).toBe(18);
  });

  it('cumpleaños hoy en otro año también cuenta como cumplido', () => {
    expect(calcularEdad('2000-10-18', hoy)).toBe(26);
  });

  it('maneja el 29 de febrero', () => {
    expect(calcularEdad('2008-02-29', new Date(2026, 1, 28))).toBe(17);
    expect(calcularEdad('2008-02-29', new Date(2026, 2, 1))).toBe(18);
  });

  it('devuelve null con fechas inválidas', () => {
    expect(calcularEdad('2026-02-30', hoy)).toBeNull();
    expect(calcularEdad('no es fecha', hoy)).toBeNull();
    expect(parsearFecha('')).toBeNull();
  });
});
