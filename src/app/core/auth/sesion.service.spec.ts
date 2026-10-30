import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { cuerpoError, usuarioPrueba } from '../../../testing/datos-prueba';
import { API, proveedoresHttpPrueba } from '../../../testing/proveedores-prueba';
import { NotificacionService } from '../notificaciones/notificacion.service';
import { SesionService } from './sesion.service';

describe('SesionService', () => {
  let sesion: SesionService;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: proveedoresHttpPrueba() });
    sesion = TestBed.inject(SesionService);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('restaurar() guarda el usuario de /auth/me', async () => {
    const promesa = sesion.restaurar();
    backend.expectOne(`${API}/auth/me`).flush(usuarioPrueba());
    expect(await promesa).toEqual(usuarioPrueba());
    expect(sesion.autenticado()).toBe(true);
    expect(sesion.cuentaActiva()).toBe(true);
  });

  it('restaurar() con 401 deja null sin notificar', async () => {
    const promesa = sesion.restaurar();
    backend
      .expectOne(`${API}/auth/me`)
      .flush(cuerpoError('SESION_INVALIDA'), { status: 401, statusText: '' });
    expect(await promesa).toBeNull();
    expect(sesion.usuario()).toBeNull();
    expect(TestBed.inject(NotificacionService).cola()).toHaveLength(0);
  });

  it('asegurarRestaurada() consulta una sola vez', async () => {
    const a = sesion.asegurarRestaurada();
    const b = sesion.asegurarRestaurada();
    backend.expectOne(`${API}/auth/me`).flush(usuarioPrueba());
    expect(await a).toEqual(await b);
  });

  it('cerrar() llama a /auth/logout y limpia la sesión aunque falle', () => {
    sesion.establecer(usuarioPrueba());
    sesion.cerrar().subscribe({ error: () => undefined });
    const req = backend.expectOne(`${API}/auth/logout`);
    expect(req.request.method).toBe('POST');
    req.flush(null, { status: 500, statusText: '' });
    expect(sesion.usuario()).toBeNull();
  });

  it('nunca guarda datos en el almacenamiento del navegador', async () => {
    const guardar = vi.spyOn(Storage.prototype, 'setItem');
    const promesa = sesion.restaurar();
    backend.expectOne(`${API}/auth/me`).flush(usuarioPrueba());
    await promesa;
    sesion.establecer(usuarioPrueba());
    expect(guardar).not.toHaveBeenCalled();
  });
});
