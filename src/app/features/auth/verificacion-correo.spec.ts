import { Location } from '@angular/common';
import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { cuerpoError, usuarioPrueba } from '../../../testing/datos-prueba';
import { API, proveedoresHttpPrueba } from '../../../testing/proveedores-prueba';
import { SesionService } from '../../core/auth/sesion.service';
import { EstadoVerificacionCorreo, UsuarioPublico } from '../../core/models';
import { NotificacionService } from '../../core/notificaciones/notificacion.service';
import {
  INTERVALO_REVISION_MS,
  VerificaCorreoPageComponent,
} from './verifica-correo-page/verifica-correo-page.component';
import { VerificarCorreoPageComponent } from './verificar-correo-page/verificar-correo-page.component';

const SIN_VERIFICAR = usuarioPrueba({ correo_verificado: false });
const ESTADO_URL = `${API}/auth/verificar-correo/estado`;

function botonCon(el: HTMLElement, texto: string): HTMLButtonElement | undefined {
  return [...el.querySelectorAll<HTMLButtonElement>('button')].find(
    (b) => b.textContent?.trim() === texto,
  );
}

describe('VerificaCorreoPageComponent (/verifica-tu-correo)', () => {
  let fixture: ComponentFixture<VerificaCorreoPageComponent>;
  let backend: HttpTestingController;
  let navegar: ReturnType<typeof vi.spyOn>;
  let el: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    TestBed.configureTestingModule({
      imports: [VerificaCorreoPageComponent],
      providers: proveedoresHttpPrueba(),
    });
    backend = TestBed.inject(HttpTestingController);
    navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  afterEach(() => {
    fixture?.destroy();
    vi.useRealTimers();
    vi.restoreAllMocks();
    backend.verify();
  });

  function estado(cambios: Partial<EstadoVerificacionCorreo> = {}): EstadoVerificacionCorreo {
    return {
      correo_verificado: false,
      correo_enmascarado: 'l***@correo.com',
      puede_reenviar_en_segundos: 0,
      ...cambios,
    };
  }

  async function abrir(datos = estado(), usuario: UsuarioPublico = SIN_VERIFICAR): Promise<void> {
    TestBed.inject(SesionService).establecer(usuario);
    fixture = TestBed.createComponent(VerificaCorreoPageComponent);
    fixture.detectChanges();
    backend.expectOne(ESTADO_URL).flush(datos);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  }

  const boton = (texto: string) => botonCon(el, texto);

  async function avanzar(ms: number): Promise<void> {
    vi.advanceTimersByTime(ms);
    await fixture.whenStable();
  }

  it('muestra el correo enmascarado, la ayuda de spam y Vex escuchando', async () => {
    await abrir();
    expect(el.querySelector('h1')?.textContent).toContain('Confirma tu correo para empezar');
    expect(el.textContent).toContain(
      'Te enviamos un mensaje a l***@correo.com. Ábrelo y pulsa «Confirmar mi correo».',
    );
    expect(el.textContent).toContain('¿No lo ves? Revisa la carpeta de spam.');
    expect(boton('Ya lo confirmé, revisar')).toBeDefined();
    expect(boton('Cerrar sesión')).toBeDefined();
    expect(el.querySelector('.verifica__pasos')).toBeNull();
    expect(el.textContent).not.toContain('Todavía no vemos');
  });

  it('el reenvío espera la cuenta regresiva de puede_reenviar_en_segundos', async () => {
    // Pestaña oculta: la revisión automática no interfiere con la cuenta regresiva.
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    await abrir(estado({ puede_reenviar_en_segundos: 75 }));
    expect(el.textContent).toContain('Podrás pedir otro en 1:15');
    expect(boton('Reenviar correo')?.disabled).toBe(true);
    await avanzar(75_000);
    expect(el.textContent).not.toContain('Podrás pedir otro');
    expect(boton('Reenviar correo')?.disabled).toBe(false);
  });

  it('reenviar muestra un aviso breve y toma la nueva espera del backend', async () => {
    const exito = vi.spyOn(TestBed.inject(NotificacionService), 'exito');
    await abrir();
    boton('Reenviar correo')?.click();
    const req = backend.expectOne(`${API}/auth/verificar-correo/reenviar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.flush(null, { status: 202, statusText: 'Accepted' });
    backend.expectOne(ESTADO_URL).flush(estado({ puede_reenviar_en_segundos: 60 }));
    await fixture.whenStable();
    expect(exito).toHaveBeenCalledWith('Listo, te enviamos otro correo.');
    expect(el.textContent).toContain('Podrás pedir otro en 1:00');
  });

  it('un 429 usa Retry-After para la cuenta regresiva', async () => {
    await abrir();
    boton('Reenviar correo')?.click();
    backend
      .expectOne(`${API}/auth/verificar-correo/reenviar`)
      .flush(cuerpoError('DEMASIADAS_SOLICITUDES'), {
        status: 429,
        statusText: '',
        headers: { 'Retry-After': '40' },
      });
    await fixture.whenStable();
    expect(el.textContent).toContain('Ya pediste varios correos');
    expect(el.textContent).toContain('Podrás pedir otro en 0:40');
    expect(boton('Reenviar correo')?.disabled).toBe(true);
  });

  it('«Ya lo confirmé, revisar» con el correo confirmado va al destino', async () => {
    await abrir();
    boton('Ya lo confirmé, revisar')?.click();
    backend.expectOne(`${API}/auth/me`).flush(usuarioPrueba());
    await fixture.whenStable();
    expect(navegar).toHaveBeenCalledExactlyOnceWith('/tema');
  });

  it('un menor con el correo confirmado sigue a la autorización', async () => {
    const menor = { es_menor: true, estado_cuenta: 'PENDIENTE_AUTORIZACION' } as const;
    TestBed.inject(SesionService).establecer(usuarioPrueba({ ...menor, correo_verificado: false }));
    fixture = TestBed.createComponent(VerificaCorreoPageComponent);
    fixture.detectChanges();
    backend.expectOne(`${API}/autorizaciones/mia`).flush({
      estado: 'PENDIENTE_VERIFICACION',
      correo_acudiente_enmascarado: 'p***@correo.com',
      puede_reenviar_en_segundos: 0,
    });
    backend.expectOne(ESTADO_URL).flush(estado());
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
    const pasos = [...el.querySelectorAll('.verifica__pasos li')].map((li) =>
      li.textContent?.replace(/\s+/g, ' ').trim(),
    );
    expect(pasos).toEqual([
      'Confirmar tu correo (Ahora)',
      'Autorización de tu adulto responsable · Esperando respuesta',
    ]);

    boton('Ya lo confirmé, revisar')?.click();
    backend.expectOne(`${API}/auth/me`).flush(usuarioPrueba(menor));
    await fixture.whenStable();
    expect(navegar).toHaveBeenCalledExactlyOnceWith('/pendiente-autorizacion');
  });

  it('«Ya lo confirmé, revisar» sin confirmar se queda y lo explica', async () => {
    await abrir();
    boton('Ya lo confirmé, revisar')?.click();
    backend.expectOne(`${API}/auth/me`).flush(SIN_VERIFICAR);
    await fixture.whenStable();
    expect(navegar).not.toHaveBeenCalled();
    expect(el.textContent).toContain('Todavía no vemos la confirmación');
  });

  it('si el estado ya dice verificado, avanza sin esperar el clic', async () => {
    await abrir(estado({ correo_verificado: true }));
    backend.expectOne(`${API}/auth/me`).flush(usuarioPrueba());
    await fixture.whenStable();
    expect(navegar).toHaveBeenCalledExactlyOnceWith('/tema');
  });

  it('cerrar sesión llama al backend y va a /login', async () => {
    await abrir();
    boton('Cerrar sesión')?.click();
    backend.expectOne(`${API}/auth/logout`).flush(null);
    await fixture.whenStable();
    expect(navegar).toHaveBeenCalledWith('/login');
    expect(TestBed.inject(SesionService).usuario()).toBeNull();
  });

  it('un error al consultar muestra el mensaje neutro y permite reintentar', async () => {
    TestBed.inject(SesionService).establecer(SIN_VERIFICAR);
    fixture = TestBed.createComponent(VerificaCorreoPageComponent);
    fixture.detectChanges();
    backend.expectOne(ESTADO_URL).flush(cuerpoError('ERROR_INTERNO'), {
      status: 500,
      statusText: '',
    });
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(
      'No pudimos completar esto. Intenta de nuevo en unos minutos.',
    );
    boton('Reintentar')?.click();
    backend.expectOne(ESTADO_URL).flush(estado());
    await fixture.whenStable();
    expect(el.textContent).toContain('l***@correo.com');
  });

  it('la revisión automática cada 15 s redirige una sola vez y luego se detiene', async () => {
    await abrir();
    await avanzar(INTERVALO_REVISION_MS);
    backend.expectOne(`${API}/auth/me`).flush(SIN_VERIFICAR);
    await fixture.whenStable();
    expect(navegar).not.toHaveBeenCalled();
    // La revisión automática no muestra el aviso: solo el clic lo hace.
    expect(el.textContent).not.toContain('Todavía no vemos');

    await avanzar(INTERVALO_REVISION_MS);
    boton('Ya lo confirmé, revisar')?.click(); // coincide con la revisión automática
    backend.expectOne(`${API}/auth/me`).flush(usuarioPrueba());
    await fixture.whenStable();
    await avanzar(INTERVALO_REVISION_MS * 3);
    backend.expectNone(`${API}/auth/me`);
    expect(navegar).toHaveBeenCalledExactlyOnceWith('/tema');
  });

  it('no revisa mientras la pestaña está oculta ni después de salir', async () => {
    const visibilidad = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    await abrir();
    await avanzar(INTERVALO_REVISION_MS * 2);
    backend.expectNone(`${API}/auth/me`);
    visibilidad.mockReturnValue('visible');
    fixture.destroy();
    vi.advanceTimersByTime(INTERVALO_REVISION_MS * 2);
    backend.expectNone(`${API}/auth/me`);
  });
});

describe('VerificarCorreoPageComponent (/verificar-correo#token=…)', () => {
  const TOKEN = 'vrf_abcdefghijklmnopqrstuvwxyz';
  const VERIFICAR_URL = `${API}/auth/verificar-correo`;
  const NEUTRO = 'No pudimos completar esto. Intenta de nuevo en unos minutos.';
  const INVALIDO = 'Este enlace ya no es válido. Ingresa a TutorIA y pide uno nuevo.';
  let backend: HttpTestingController;
  let location: Location;
  let navegar: ReturnType<typeof vi.spyOn>;
  let ruta: { snapshot: { fragment: string | null } };

  function configurar(fragmento: string | null): void {
    ruta = { snapshot: { fragment: fragmento } };
    TestBed.configureTestingModule({
      imports: [VerificarCorreoPageComponent],
      providers: [...proveedoresHttpPrueba(), { provide: ActivatedRoute, useValue: ruta }],
    });
    backend = TestBed.inject(HttpTestingController);
    location = TestBed.inject(Location);
    vi.spyOn(location, 'path').mockReturnValue('/verificar-correo');
    vi.spyOn(location, 'replaceState');
    navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  }

  function crear(): ComponentFixture<VerificarCorreoPageComponent> {
    const fixture = TestBed.createComponent(VerificarCorreoPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  /** Espera la restauración de la sesión (promesa) y el render. */
  async function estable(f: ComponentFixture<unknown>): Promise<void> {
    await Promise.resolve();
    await f.whenStable();
  }

  const texto = (f: ComponentFixture<unknown>) =>
    (f.nativeElement as HTMLElement).textContent ?? '';

  afterEach(() => backend.verify());

  it('éxito {"estado":"VERIFICADO"} con sesión: celebra y «Continuar» va al siguiente paso', async () => {
    configurar(`token=${TOKEN}`);
    const fixture = crear();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Confirmando tu correo…');
    expect(botonCon(el, 'Continuar')?.disabled).toBe(true);
    const req = backend.expectOne(VERIFICAR_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ token: TOKEN });
    expect(req.request.withCredentials).toBe(false);
    expect(req.request.urlWithParams).not.toContain(TOKEN);
    req.flush({ estado: 'VERIFICADO' });
    backend.expectOne(`${API}/auth/me`).flush(usuarioPrueba());
    await estable(fixture);
    expect(texto(fixture)).toContain('¡Listo! Confirmamos tu correo.');
    botonCon(el, 'Continuar')?.click();
    expect(navegar).toHaveBeenCalledWith('/tema');
  });

  it('éxito sin sesión ofrece «Ingresar» hacia /login', async () => {
    configurar(`token=${TOKEN}`);
    const fixture = crear();
    backend.expectOne(VERIFICAR_URL).flush({ estado: 'VERIFICADO' });
    backend
      .expectOne(`${API}/auth/me`)
      .flush(cuerpoError('SESION_INVALIDA'), { status: 401, statusText: '' });
    await estable(fixture);
    expect(texto(fixture)).toContain('¡Listo! Confirmamos tu correo.');
    botonCon(fixture.nativeElement, 'Ingresar')?.click();
    expect(navegar).toHaveBeenCalledWith('/login');
  });

  it('404 VERIFICACION_INVALIDA: enlace no válido con «Ingresar»', async () => {
    configurar(`token=${TOKEN}`);
    const fixture = crear();
    backend
      .expectOne(VERIFICAR_URL)
      .flush(cuerpoError('VERIFICACION_INVALIDA'), { status: 404, statusText: '' });
    await fixture.whenStable();
    expect(texto(fixture)).toContain(INVALIDO);
    expect(botonCon(fixture.nativeElement, 'Ingresar')).toBeDefined();
    expect(botonCon(fixture.nativeElement, 'Reintentar')).toBeUndefined();
  });

  it('sin token: enlace no válido y no llama a la API', async () => {
    configurar(null);
    const fixture = crear();
    await fixture.whenStable();
    backend.expectNone(VERIFICAR_URL);
    expect(texto(fixture)).toContain(INVALIDO);
  });

  it('error de red: mensaje neutro y reintenta con el mismo token', async () => {
    configurar(`token=${TOKEN}`);
    const fixture = crear();
    backend.expectOne(VERIFICAR_URL).error(new ProgressEvent('error'));
    await fixture.whenStable();
    expect(texto(fixture)).toContain(NEUTRO);
    expect(texto(fixture)).not.toContain('Este enlace ya no es válido');
    botonCon(fixture.nativeElement, 'Reintentar')?.click();
    const otra = backend.expectOne(VERIFICAR_URL);
    expect(otra.request.body).toEqual({ token: TOKEN });
    otra.flush({ estado: 'VERIFICADO' });
    backend.expectOne(`${API}/auth/me`).flush(usuarioPrueba());
    await estable(fixture);
    expect(texto(fixture)).toContain('¡Listo! Confirmamos tu correo.');
  });

  it.each([
    ['un estado desconocido', { estado: 'EN_PROCESO' }, 200],
    ['otro error del servidor', cuerpoError('ERROR_INTERNO'), 500],
    ['un 404 con otro código', cuerpoError('NO_ENCONTRADO'), 404],
  ])('%s muestra el mensaje neutro', async (_caso, cuerpo, status) => {
    configurar(`token=${TOKEN}`);
    const fixture = crear();
    backend.expectOne(VERIFICAR_URL).flush(cuerpo, { status, statusText: '' });
    await fixture.whenStable();
    expect(texto(fixture)).toContain(NEUTRO);
    expect(texto(fixture)).not.toContain('Este enlace ya no es válido');
  });

  it('borra el token de la URL, no lo guarda ni lo registra y no lo pierde si se crea dos veces', async () => {
    const guardar = vi.spyOn(Storage.prototype, 'setItem');
    const registro = vi.spyOn(console, 'log');
    configurar(`token=${TOKEN}`);
    const primera = crear();
    expect(location.replaceState).toHaveBeenCalledWith('/verificar-correo');
    // La URL ya no trae el fragmento cuando la pantalla se crea otra vez.
    ruta.snapshot.fragment = null;
    primera.destroy();
    const segunda = crear();
    const req = backend.expectOne(VERIFICAR_URL); // una sola petición para ambas
    expect(req.request.body).toEqual({ token: TOKEN });
    req.flush({ estado: 'VERIFICADO' });
    backend.expectOne(`${API}/auth/me`).flush(usuarioPrueba());
    await estable(segunda);
    expect(texto(segunda)).toContain('¡Listo! Confirmamos tu correo.');
    expect(texto(segunda)).not.toContain('Este enlace ya no es válido');
    expect(guardar).not.toHaveBeenCalled();
    expect(registro.mock.calls.flat().join(' ')).not.toContain(TOKEN);
  });
});
