import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, Subscription, concatMap, filter, finalize, map, of, tap, timer } from 'rxjs';
import { ArchivoApiService } from '../../core/api/archivo-api.service';
import { ConversacionApiService } from '../../core/api/conversacion-api.service';
import { CapacidadesService } from '../../core/auth/capacidades.service';
import {
  ApiError,
  ArchivoPublico,
  ConversacionPublica,
  FeedbackEntrada,
  ReferenciaPublica,
  ReporteEntrada,
  ResumenSesion,
  Uuid,
  comoApiError,
  tieneCodigo,
} from '../../core/models';
import { conIndicador } from '../../shared/utils/con-indicador';
import { mensajeEnviable, normalizarTexto } from '../../shared/validators';
import {
  MensajeChat,
  desdeMensajePublico,
  desdeMensajeTutor,
  mensajeLocalDeUsuario,
} from './mensaje-chat';
import { TEXTOS_CHAT } from './tutor.textos';

export const DEMORA_AVISO_MS = 10_000;

/** Errores que se muestran junto al selector de archivo. */
const CODIGOS_ARCHIVO = [
  'ARCHIVO_NO_PERMITIDO',
  'ARCHIVO_MUY_GRANDE',
  'ARCHIVO_INVALIDO',
  'CONTENIDO_NO_PERMITIDO',
] as const;

/**
 * Estado de una conversación con el tutor. HTTP solo a través de los servicios de API; aquí no hay
 * lógica de presentación. Se provee en `ChatPage` (una instancia por chat).
 */
@Injectable()
export class ChatStore {
  private readonly api = inject(ConversacionApiService);
  private readonly archivoApi = inject(ArchivoApiService);
  private readonly capacidades = inject(CapacidadesService);

  readonly conversacion = signal<ConversacionPublica | null>(null);
  readonly mensajes = signal<readonly MensajeChat[]>([]);
  readonly referencias = signal<readonly ReferenciaPublica[]>([]);
  readonly cargando = signal(false);
  readonly errorCarga = signal(false);
  readonly enviando = signal(false);
  readonly demorado = signal(false);
  readonly cerrando = signal(false);
  /** Error del último envío (el turno fallido no se guarda en el servidor). */
  readonly error = signal<ApiError | null>(null);
  /** Lo que escribió el estudiante: se conserva si el envío falla. */
  readonly borrador = signal('');
  readonly adjunto = signal<File | null>(null);
  readonly progresoAdjunto = signal<number | null>(null);
  readonly errorAdjunto = signal<string | null>(null);
  readonly reportados = signal<Readonly<Record<Uuid, true>>>({});
  /** Última respuesta recibida (para anunciarla por aria-live). */
  readonly ultimaRespuesta = signal<MensajeChat | null>(null);

  readonly cerrada = computed(() => this.conversacion()?.estado === 'CERRADA');
  readonly aceptaArchivos = computed(() => this.conversacion()?.acepta_archivos ?? false);
  readonly puedeEnviar = computed(
    () => !this.enviando() && !this.cerrada() && mensajeEnviable(this.borrador()),
  );

  private archivoSubido: ArchivoPublico | null = null;
  private temporizadorDemora: Subscription | null = null;
  private cerradaPorUsuario = false;

  /** Deja el estado limpio para abrir otra conversación en la misma pantalla. */
  reiniciar(): void {
    this.conversacion.set(null);
    this.mensajes.set([]);
    this.referencias.set([]);
    this.error.set(null);
    this.borrador.set('');
    this.ultimaRespuesta.set(null);
    this.reportados.set({});
    this.quitarAdjunto();
    this.detenerDemora();
    this.cerradaPorUsuario = false;
  }

  cargar(idConversacion: Uuid): void {
    this.errorCarga.set(false);
    this.api
      .obtener(idConversacion)
      .pipe(conIndicador(this.cargando))
      .subscribe({
        next: ({ mensajes, ...conversacion }) => {
          this.conversacion.set(conversacion);
          this.mensajes.set(mensajes.map(desdeMensajePublico));
          if (conversacion.estado === 'CERRADA') {
            this.cargarReferencias();
          }
        },
        error: () => this.errorCarga.set(true),
      });
  }

  elegirAdjunto(archivo: File): void {
    this.adjunto.set(archivo);
    this.archivoSubido = null;
    this.errorAdjunto.set(null);
  }

  quitarAdjunto(): void {
    this.adjunto.set(null);
    this.archivoSubido = null;
    this.errorAdjunto.set(null);
  }

  /** Envía el borrador (y el adjunto, si hay). Reintentar es volver a llamar. */
  enviar(): void {
    const conversacion = this.conversacion();
    const texto = normalizarTexto(this.borrador());
    if (!conversacion || !this.puedeEnviar()) {
      return;
    }
    this.error.set(null);
    this.errorAdjunto.set(null);
    this.iniciarDemora();
    let local: MensajeChat | null = null;

    this.subirAdjunto(conversacion.id_conversacion)
      .pipe(
        tap((archivo) => {
          local = mensajeLocalDeUsuario(texto, archivo);
          this.mensajes.update((lista) => [...lista, local as MensajeChat]);
        }),
        concatMap((archivo) =>
          this.api.enviarMensaje(conversacion.id_conversacion, texto, archivo?.id_archivo),
        ),
        conIndicador(this.enviando),
        finalize(() => this.detenerDemora()),
      )
      .subscribe({
        next: (respuesta) => {
          const mensaje = desdeMensajeTutor(respuesta, TEXTOS_CHAT.respuestaNoAcademica);
          this.mensajes.update((lista) => [
            ...lista.map((m) => (m === local ? { ...m, local: false } : m)),
            mensaje,
          ]);
          this.ultimaRespuesta.set(mensaje);
          this.borrador.set('');
          this.quitarAdjunto();
        },
        error: (e: unknown) => {
          this.mensajes.update((lista) => lista.filter((m) => m !== local));
          this.registrarError(comoApiError(e));
        },
      });
  }

  registrarFeedback(idMensaje: Uuid, feedback: FeedbackEntrada): void {
    this.actualizarMensaje(idMensaje, { util: feedback.util });
    this.api.registrarFeedback(idMensaje, feedback).subscribe({ error: () => undefined });
  }

  reportar(idMensaje: Uuid, reporte: ReporteEntrada): void {
    this.api.reportar(idMensaje, reporte).subscribe({
      next: () => this.reportados.update((ids) => ({ ...ids, [idMensaje]: true })),
      error: () => undefined,
    });
  }

  /** "Terminar sesión": cierra y devuelve el resumen con referencias APA 7. */
  cerrar(): Observable<ResumenSesion> {
    const conversacion = this.conversacion();
    if (!conversacion) {
      return of();
    }
    this.cerradaPorUsuario = true;
    return this.api.cerrar(conversacion.id_conversacion).pipe(
      conIndicador(this.cerrando),
      tap((resumen) => {
        this.conversacion.set({ ...conversacion, estado: 'CERRADA' });
        this.referencias.set(resumen.referencias);
      }),
    );
  }

  /** Cierre automático al salir del chat (no bloquea la navegación ni notifica). */
  cerrarAlSalir(): void {
    const conversacion = this.conversacion();
    if (this.debeCerrarseSola(conversacion)) {
      this.api.cerrar(conversacion.id_conversacion, { silencioso: true }).subscribe({
        error: () => undefined,
      });
    }
  }

  /** Cierre al cerrar la pestaña (`fetch` con `keepalive`). */
  cerrarAlCerrarPestana(): void {
    const conversacion = this.conversacion();
    if (this.debeCerrarseSola(conversacion)) {
      this.cerradaPorUsuario = true;
      this.api.cerrarAlSalir(conversacion.id_conversacion);
    }
  }

  private debeCerrarseSola(c: ConversacionPublica | null): c is ConversacionPublica {
    return (
      c !== null && c.estado === 'ABIERTA' && !this.cerradaPorUsuario && this.mensajes().length > 0
    );
  }

  private subirAdjunto(idConversacion: Uuid): Observable<ArchivoPublico | null> {
    const archivo = this.adjunto();
    if (!archivo || !this.aceptaArchivos()) {
      return of(null);
    }
    if (this.archivoSubido) {
      return of(this.archivoSubido);
    }
    return this.archivoApi.subir(archivo, 'CONVERSACION', idConversacion).pipe(
      tap((evento) => {
        if (evento.tipo === 'progreso') {
          this.progresoAdjunto.set(evento.porcentaje);
        }
      }),
      filter((evento) => evento.tipo === 'completado'),
      map((evento) => (evento.tipo === 'completado' ? evento.archivo : null)),
      tap((subido) => {
        this.archivoSubido = subido;
        this.capacidades.refrescar();
      }),
      finalize(() => this.progresoAdjunto.set(null)),
    );
  }

  private registrarError(error: ApiError): void {
    if (tieneCodigo(error, ...CODIGOS_ARCHIVO)) {
      this.errorAdjunto.set(error.mensaje);
      return;
    }
    if (tieneCodigo(error, 'CONVERSACION_CERRADA')) {
      this.conversacion.update((c) => (c ? { ...c, estado: 'CERRADA' } : c));
    }
    this.error.set(error);
  }

  private cargarReferencias(): void {
    const conversacion = this.conversacion();
    if (conversacion) {
      this.api.referencias(conversacion.id_conversacion).subscribe({
        next: (referencias) => this.referencias.set(referencias),
        error: () => undefined,
      });
    }
  }

  private actualizarMensaje(id: Uuid, cambios: Partial<MensajeChat>): void {
    this.mensajes.update((lista) => lista.map((m) => (m.id === id ? { ...m, ...cambios } : m)));
  }

  private iniciarDemora(): void {
    this.detenerDemora();
    this.temporizadorDemora = timer(DEMORA_AVISO_MS).subscribe(() => this.demorado.set(true));
  }

  private detenerDemora(): void {
    this.temporizadorDemora?.unsubscribe();
    this.temporizadorDemora = null;
    this.demorado.set(false);
  }
}
