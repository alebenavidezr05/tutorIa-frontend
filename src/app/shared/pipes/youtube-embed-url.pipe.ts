import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/** Espejo de `_PATRON_YOUTUBE_ID` del backend. */
export const PATRON_YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const BASE_EMBED = 'https://www.youtube-nocookie.com/embed/';

export function esYoutubeIdValido(id: string | null | undefined): id is string {
  return typeof id === 'string' && PATRON_YOUTUBE_ID.test(id);
}

/**
 * EXCEPCIÓN DOCUMENTADA 2 de 2 (y última) a la regla "nunca bypassSecurityTrust*" (§2.9).
 *
 * Por qué es seguro:
 * - Recibe solo un `youtube_id` y lo valida con `^[A-Za-z0-9_-]{11}$`: no puede contener `/`, `?`,
 *   `#`, `:` ni espacios, así que es imposible cambiar el dominio, la ruta o los parámetros.
 * - La URL se construye aquí con el dominio fijo `youtube-nocookie.com` (modo de privacidad).
 * - Sin `autoplay`. Con un id inválido devuelve `null` y la plantilla no crea el iframe.
 * Angular exige `SafeResourceUrl` para `<iframe src>`; por eso se marca como confiable.
 */
@Pipe({ name: 'youtubeEmbedUrl' })
export class YoutubeEmbedUrlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(youtubeId: string | null | undefined): SafeResourceUrl | null {
    if (!esYoutubeIdValido(youtubeId)) {
      return null;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(`${BASE_EMBED}${youtubeId}?rel=0`);
  }
}
