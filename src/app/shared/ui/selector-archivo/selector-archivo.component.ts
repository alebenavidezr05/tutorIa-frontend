import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TamanoArchivoPipe } from '../../pipes/tamano-archivo.pipe';
import { ACCEPT_ARCHIVO, esImagen, validarArchivo } from '../../validators/archivo.validator';
import { MENSAJES_VALIDACION } from '../../validators/mensajes-validacion';
import { BarraProgresoComponent } from '../barra-progreso/barra-progreso.component';
import { IconoComponent } from '../icono/icono.component';
import { TEXTO_ARCHIVO } from '../textos-ui';

let contador = 0;

/**
 * Selector de archivo (nivel Avanzado). Valida tipo y tamaño solo como ayuda: la validación real,
 * por contenido, es del backend. Es controlado: el archivo elegido lo guarda el contenedor, así
 * que se conserva ante un error del servidor.
 */
@Component({
  selector: 'app-selector-archivo',
  imports: [IconoComponent, BarraProgresoComponent, TamanoArchivoPipe],
  templateUrl: './selector-archivo.component.html',
  styleUrl: './selector-archivo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectorArchivoComponent {
  /** Archivo elegido (lo mantiene el contenedor). */
  readonly archivo = input<File | null>(null);
  /** Mensaje de error del servidor (`ARCHIVO_*`, `CONTENIDO_NO_PERMITIDO`). */
  readonly errorServidor = input<string | null>(null);
  readonly progreso = input<number | null>(null);
  readonly deshabilitado = input(false);
  readonly etiqueta = input<string>(TEXTO_ARCHIVO.boton);
  readonly compacto = input(false);
  /** En móvil abre directamente la cámara trasera (opcional). */
  readonly usarCamara = input(false);
  readonly seleccionar = output<File>();
  readonly quitar = output<void>();

  protected readonly textos = TEXTO_ARCHIVO;
  protected readonly accept = ACCEPT_ARCHIVO;
  protected readonly idInput = `selector-archivo-${++contador}`;
  protected readonly idAyuda = `${this.idInput}-ayuda`;
  protected readonly idError = `${this.idInput}-error`;
  protected readonly arrastrando = signal(false);
  protected readonly errorLocal = signal<string | null>(null);
  protected readonly vistaPrevia = signal<string | null>(null);

  protected readonly error = computed(() => this.errorLocal() ?? this.errorServidor());
  protected readonly esImagen = computed(() => {
    const archivo = this.archivo();
    return archivo !== null && esImagen(archivo);
  });
  protected readonly describedBy = computed(() =>
    this.error() ? `${this.idAyuda} ${this.idError}` : this.idAyuda,
  );

  constructor() {
    effect((limpiar) => {
      const archivo = this.archivo();
      const url = archivo && esImagen(archivo) ? URL.createObjectURL(archivo) : null;
      this.vistaPrevia.set(url);
      limpiar(() => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    });
    inject(DestroyRef).onDestroy(() => this.vistaPrevia.set(null));
  }

  protected alCambiar(evento: Event): void {
    const entrada = evento.target as HTMLInputElement;
    const archivo = entrada.files?.item(0) ?? null;
    entrada.value = '';
    this.elegir(archivo);
  }

  protected alArrastrar(evento: DragEvent, encima: boolean): void {
    evento.preventDefault();
    this.arrastrando.set(encima && !this.deshabilitado());
  }

  protected alSoltar(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrando.set(false);
    if (!this.deshabilitado()) {
      this.elegir(evento.dataTransfer?.files.item(0) ?? null);
    }
  }

  protected alQuitar(): void {
    this.errorLocal.set(null);
    this.quitar.emit();
  }

  private elegir(archivo: File | null): void {
    if (!archivo) {
      return;
    }
    const error = validarArchivo(archivo);
    const mensaje = error ? (MENSAJES_VALIDACION[error]?.(true) ?? null) : null;
    this.errorLocal.set(mensaje);
    if (!error) {
      this.seleccionar.emit(archivo);
    }
  }
}
