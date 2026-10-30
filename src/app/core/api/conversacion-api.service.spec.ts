import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API, proveedoresHttpPrueba } from '../../../testing/proveedores-prueba';
import { ConversacionApiService } from './conversacion-api.service';
import { PerfilAprendizajeApiService } from './perfil-aprendizaje-api.service';

describe('ConversacionApiService y PerfilAprendizajeApiService', () => {
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: proveedoresHttpPrueba() });
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  function esperar(metodo: string, url: string): TestRequest {
    const req = backend.expectOne((r) => r.urlWithParams === url);
    expect(req.request.method).toBe(metodo);
    expect(req.request.withCredentials).toBe(true);
    return req;
  }

  it('cubre todos los endpoints de conversaciones', () => {
    const api = TestBed.inject(ConversacionApiService);
    api.crear({ id_plan: 'plan-1' }).subscribe();
    expect(esperar('POST', `${API}/conversaciones`).request.body).toEqual({ id_plan: 'plan-1' });
    api.listar(1, 20).subscribe();
    esperar('GET', `${API}/conversaciones?pagina=1&tamano=20`);
    api.obtener('c-1').subscribe();
    esperar('GET', `${API}/conversaciones/c-1`);
    api.enviarMensaje('c-1', 'Hola').subscribe();
    expect(esperar('POST', `${API}/conversaciones/c-1/mensajes`).request.body).toEqual({
      contenido: 'Hola',
    });
    api.enviarMensaje('c-1', 'Mi resumen', 'ar-1').subscribe();
    expect(esperar('POST', `${API}/conversaciones/c-1/mensajes`).request.body).toEqual({
      contenido: 'Mi resumen',
      id_archivo: 'ar-1',
    });
    api.cerrar('c-1').subscribe();
    esperar('POST', `${API}/conversaciones/c-1/cerrar`);
    api.referencias('c-1').subscribe();
    esperar('GET', `${API}/conversaciones/c-1/referencias`);
    api.eliminar('c-1').subscribe();
    esperar('DELETE', `${API}/conversaciones/c-1`);
    api.registrarFeedback('m-1', { util: false, motivo: 'MUY_LARGO' }).subscribe();
    esperar('POST', `${API}/mensajes/m-1/feedback`);
    api.reportar('m-1', { categoria: 'CONTENIDO_INCORRECTO' }).subscribe();
    esperar('POST', `${API}/mensajes/m-1/reportar`);
  });

  it('cerrarAlSalir usa fetch con keepalive y credenciales', () => {
    const fetchSimulado = vi.fn().mockResolvedValue(new Response(null));
    vi.stubGlobal('fetch', fetchSimulado);
    TestBed.inject(ConversacionApiService).cerrarAlSalir('c-1');
    expect(fetchSimulado).toHaveBeenCalledWith(`${API}/conversaciones/c-1/cerrar`, {
      method: 'POST',
      keepalive: true,
      credentials: 'include',
    });
    vi.unstubAllGlobals();
  });

  it('PerfilAprendizajeApiService', () => {
    const api = TestBed.inject(PerfilAprendizajeApiService);
    api.obtener().subscribe();
    esperar('GET', `${API}/perfil-aprendizaje`);
    api.cambiarPersonalizacion(false).subscribe();
    expect(esperar('PUT', `${API}/perfil-aprendizaje/personalizacion`).request.body).toEqual({
      activa: false,
    });
    api.reiniciar().subscribe();
    esperar('DELETE', `${API}/perfil-aprendizaje`);
  });
});
