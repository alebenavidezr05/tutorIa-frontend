import { Observable, concatMap, from, switchMap, takeWhile, timer } from 'rxjs';
import { Uuid, VisualPublico } from '../../../core/models';

export const INTERVALO_RAPIDO_MS = 2000;
export const INTENTOS_RAPIDOS = 8;
export const INTERVALO_LENTO_MS = 5000;
export const TIEMPO_MAXIMO_MS = 60_000;

/** Esperas entre consultas: cada 2 s hasta 8 intentos y luego cada 5 s hasta 60 s en total. */
export function calcularEsperasSondeo(): number[] {
  const esperas: number[] = Array.from({ length: INTENTOS_RAPIDOS }, () => INTERVALO_RAPIDO_MS);
  let total = INTENTOS_RAPIDOS * INTERVALO_RAPIDO_MS;
  while (total + INTERVALO_LENTO_MS <= TIEMPO_MAXIMO_MS) {
    esperas.push(INTERVALO_LENTO_MS);
    total += INTERVALO_LENTO_MS;
  }
  return esperas;
}

export function esVisualPendiente(visual: VisualPublico | null): boolean {
  return visual?.estado === 'PENDIENTE' || visual?.estado === 'PROCESANDO';
}

/**
 * Consulta el visual hasta que deja de estar pendiente (emite también el estado final) o se
 * agotan los 60 s. Quien se suscribe lo detiene al salir de la pantalla.
 */
export function sondearVisual(
  consultar: (idMensaje: Uuid) => Observable<VisualPublico>,
  idMensaje: Uuid,
  esperas: readonly number[] = calcularEsperasSondeo(),
): Observable<VisualPublico> {
  return from(esperas).pipe(
    concatMap((ms) => timer(ms).pipe(switchMap(() => consultar(idMensaje)))),
    takeWhile((visual) => esVisualPendiente(visual), true),
  );
}
