import { HttpClient, HttpContext } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { API, proveedoresHttpPrueba } from '../../../testing/proveedores-prueba';
import { cuerpoError, usuarioPrueba } from '../../../testing/datos-prueba';
import { CapacidadesService } from '../auth/capacidades.service';
import { SesionService } from '../auth/sesion.service';
import { ApiError } from '../models';
import { NotificacionService } from '../notificaciones/notificacion.service';
import { OMITIR_NOTIFICACION } from './contextos';
import { MENSAJE_SIN_CONEXION } from './mapear-error';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let notificaciones: NotificacionService;
  let router: Router;
  let sesion: SesionService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: proveedoresHttpPrueba() });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    notificaciones = TestBed.inject(NotificacionService);
    router = TestBed.inject(Router);
    sesion = TestBed.inject(SesionService);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => backend.verify());

  function pedir(contexto?: HttpContext): Promise<ApiError> {
    return new Promise((resolver) =>
      http
        .get('/recurso', { context: contexto })
        .subscribe({ error: (e: ApiError) => resolver(e) }),
    );
  }

  it('convierte el cuerpo {error:{...}} en un ApiError tipado y notifica', async () => {
    const promesa = pedir();
    backend
      .expectOne(`${API}/recurso`)
      .flush(cuerpoError('RECURSO_NO_ENCONTRADO', 'No encontramos lo que buscas.'), {
        status: 404,
        statusText: 'Not Found',
      });
    const error = await promesa;
    expect(error).toEqual({
      status: 404,
      codigo: 'RECURSO_NO_ENCONTRADO',
      mensaje: 'No encontramos lo que buscas.',
      detalles: null,
    });
    expect(notificaciones.cola().map((n) => n.mensaje)).toContain('No encontramos lo que buscas.');
  });

  it('sin respuesta del servidor crea SIN_CONEXION con mensaje amable', async () => {
    const promesa = pedir();
    backend.expectOne(`${API}/recurso`).error(new ProgressEvent('error'), { status: 0 });
    const error = await promesa;
    expect(error.codigo).toBe('SIN_CONEXION');
    expect(error.mensaje).toBe(MENSAJE_SIN_CONEXION);
  });

  it('SESION_INVALIDA limpia la sesión y redirige a /login', async () => {
    sesion.establecer(usuarioPrueba());
    const promesa = pedir();
    backend
      .expectOne(`${API}/recurso`)
      .flush(cuerpoError('SESION_INVALIDA'), { status: 401, statusText: '' });
    await promesa;
    expect(sesion.usuario()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('con OMITIR_NOTIFICACION no notifica ni redirige', async () => {
    sesion.establecer(usuarioPrueba());
    const promesa = pedir(new HttpContext().set(OMITIR_NOTIFICACION, true));
    backend
      .expectOne(`${API}/recurso`)
      .flush(cuerpoError('SESION_INVALIDA'), { status: 401, statusText: '' });
    await promesa;
    expect(notificaciones.cola()).toHaveLength(0);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(sesion.usuario()).not.toBeNull();
  });

  it('no notifica los errores de formulario (422 con detalles)', async () => {
    const promesa = pedir();
    backend
      .expectOne(`${API}/recurso`)
      .flush(
        cuerpoError('DATO_INVALIDO', 'Datos inválidos', [
          { campo: 'nombre', mensaje: 'Muy corto' },
        ]),
        {
          status: 422,
          statusText: '',
        },
      );
    const error = await promesa;
    expect(error.detalles).toEqual([{ campo: 'nombre', mensaje: 'Muy corto' }]);
    expect(notificaciones.cola()).toHaveLength(0);
  });

  it('CONSENTIMIENTO_REQUERIDO convierte las finalidades faltantes en errores de campo', async () => {
    const promesa = pedir();
    backend
      .expectOne(`${API}/recurso`)
      .flush(cuerpoError('CONSENTIMIENTO_REQUERIDO', 'Faltan', { finalidades: ['TRATAMIENTO'] }), {
        status: 422,
        statusText: '',
      });
    const error = await promesa;
    expect(error.detalles?.[0]?.campo).toBe('acepta_tratamiento');
    expect(notificaciones.cola()).toHaveLength(0);
  });

  it('FUNCION_PREMIUM no muestra toast genérico y refresca las capacidades', async () => {
    const refrescar = vi
      .spyOn(TestBed.inject(CapacidadesService), 'refrescar')
      .mockImplementation(() => undefined);
    const promesa = pedir();
    backend
      .expectOne(`${API}/recurso`)
      .flush(cuerpoError('FUNCION_PREMIUM'), { status: 403, statusText: '' });
    await promesa;
    expect(refrescar).toHaveBeenCalled();
    expect(notificaciones.cola()).toHaveLength(0);
  });

  it('AUTORIZACION_PENDIENTE lleva a /pendiente-autorizacion sin toast', async () => {
    const promesa = pedir();
    backend
      .expectOne(`${API}/recurso`)
      .flush(cuerpoError('AUTORIZACION_PENDIENTE'), { status: 403, statusText: '' });
    await promesa;
    expect(router.navigate).toHaveBeenCalledWith(['/pendiente-autorizacion']);
    expect(notificaciones.cola()).toHaveLength(0);
  });

  it('CORREO_NO_VERIFICADO lleva a /verifica-tu-correo sin toast', async () => {
    const promesa = pedir();
    backend
      .expectOne(`${API}/recurso`)
      .flush(cuerpoError('CORREO_NO_VERIFICADO'), { status: 403, statusText: '' });
    await promesa;
    expect(router.navigate).toHaveBeenCalledWith(['/verifica-tu-correo']);
    expect(notificaciones.cola()).toHaveLength(0);
  });

  it('LIMITE_USO se deja a la pantalla (sin toast)', async () => {
    const promesa = pedir();
    backend
      .expectOne(`${API}/recurso`)
      .flush(cuerpoError('LIMITE_USO'), { status: 429, statusText: '' });
    expect((await promesa).codigo).toBe('LIMITE_USO');
    expect(notificaciones.cola()).toHaveLength(0);
  });

  it('POLITICA_DESACTUALIZADA con sesión redirige a /aceptar-politica', async () => {
    sesion.establecer(usuarioPrueba());
    const promesa = pedir();
    backend
      .expectOne(`${API}/recurso`)
      .flush(cuerpoError('POLITICA_DESACTUALIZADA'), { status: 409, statusText: '' });
    await promesa;
    expect(router.navigate).toHaveBeenCalledWith(['/aceptar-politica'], expect.anything());
  });

  it('POLITICA_DESACTUALIZADA sin sesión no redirige (la pantalla recarga la política)', async () => {
    const promesa = pedir();
    backend
      .expectOne(`${API}/recurso`)
      .flush(cuerpoError('POLITICA_DESACTUALIZADA'), { status: 409, statusText: '' });
    await promesa;
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('ORIGEN_NO_PERMITIDO muestra un mensaje genérico de seguridad y lo registra', async () => {
    const consola = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const promesa = pedir();
    backend
      .expectOne(`${API}/recurso`)
      .flush(cuerpoError('ORIGEN_NO_PERMITIDO', 'detalle interno'), {
        status: 403,
        statusText: '',
      });
    await promesa;
    expect(consola).toHaveBeenCalled();
    expect(notificaciones.cola()[0]?.mensaje).not.toContain('detalle interno');
  });

  it('antepone apiBaseUrl y envía credenciales', () => {
    http.get('/auth/me').subscribe();
    const req = backend.expectOne(`${API}/auth/me`);
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });
});
