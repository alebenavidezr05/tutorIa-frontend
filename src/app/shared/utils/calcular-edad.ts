const _PATRON_FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;

export interface FechaSimple {
  readonly anio: number;
  readonly mes: number;
  readonly dia: number;
}

/** Interpreta `AAAA-MM-DD` sin zonas horarias. Devuelve `null` si la fecha no existe. */
export function parsearFecha(valor: string): FechaSimple | null {
  const partes = _PATRON_FECHA.exec(valor);
  if (!partes) {
    return null;
  }
  const [anio, mes, dia] = [Number(partes[1]), Number(partes[2]), Number(partes[3])];
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  const existe =
    fecha.getUTCFullYear() === anio &&
    fecha.getUTCMonth() === mes - 1 &&
    fecha.getUTCDate() === dia;
  return existe ? { anio, mes, dia } : null;
}

export function fechaDeHoy(hoy: Date): FechaSimple {
  return { anio: hoy.getFullYear(), mes: hoy.getMonth() + 1, dia: hoy.getDate() };
}

export function compararFechas(a: FechaSimple, b: FechaSimple): number {
  return a.anio - b.anio || a.mes - b.mes || a.dia - b.dia;
}

/**
 * Edad cumplida en años (espejo de `calcular_edad` del backend). Función pura.
 * Devuelve `null` si la fecha no es válida.
 */
export function calcularEdad(fechaNacimiento: string, hoy: Date = new Date()): number | null {
  const nacimiento = parsearFecha(fechaNacimiento);
  if (!nacimiento) {
    return null;
  }
  const actual = fechaDeHoy(hoy);
  const cumplioEsteAnio =
    actual.mes > nacimiento.mes || (actual.mes === nacimiento.mes && actual.dia >= nacimiento.dia);
  return actual.anio - nacimiento.anio - (cumplioEsteAnio ? 0 : 1);
}
