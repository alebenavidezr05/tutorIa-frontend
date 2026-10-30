import { HttpEventType } from '@angular/common/http';
import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { planPrueba, usuarioPrueba } from '../../../testing/datos-prueba';
import { API, proveedoresHttpPrueba } from '../../../testing/proveedores-prueba';
import { EventoSubida } from '../models';
import { ActividadApiService } from './actividad-api.service';
import { ArchivoApiService } from './archivo-api.service';
import { AuthApiService } from './auth-api.service';
import { DiagnosticoApiService } from './diagnostico-api.service';
import { HistorialApiService } from './historial-api.service';
import { PerfilApiService } from './perfil-api.service';
import { PlanApiService } from './plan-api.service';
import { SuscripcionApiService } from './suscripcion-api.service';
import { VisualApiService } from './visual-api.service';

/** Cada servicio: URL, método y `withCredentials`. */
describe('servicios de API', () => {
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

  it('AuthApiService', () => {
    const api = TestBed.inject(AuthApiService);
    api.iniciarSesion({ correo: 'a@b.co', contrasena: 'x' }).subscribe();
    expect(esperar('POST', `${API}/auth/login`).request.body).toEqual({
      correo: 'a@b.co',
      contrasena: 'x',
    });
    api.obtenerActual().subscribe();
    esperar('GET', `${API}/auth/me`).flush(usuarioPrueba());
    api.cerrarSesion().subscribe();
    esperar('POST', `${API}/auth/logout`);
    api.registrar({} as never).subscribe();
    esperar('POST', `${API}/auth/registro`);
  });

  it('DiagnosticoApiService', () => {
    const api = TestBed.inject(DiagnosticoApiService);
    api.crear('Fracciones').subscribe();
    expect(esperar('POST', `${API}/diagnostico`).request.body).toEqual({ tema: 'Fracciones' });
    api.obtener('s-1').subscribe();
    esperar('GET', `${API}/diagnostico/s-1`);
    api.enviarRespuestas('s-1', [{ id_pregunta: 'p-1', respuesta: 'a' }]).subscribe();
    expect(esperar('POST', `${API}/diagnostico/s-1/respuestas`).request.body).toEqual({
      respuestas: [{ id_pregunta: 'p-1', respuesta: 'a' }],
    });
  });

  it('PlanApiService', () => {
    const api = TestBed.inject(PlanApiService);
    api.generar('s-1').subscribe();
    expect(esperar('POST', `${API}/plan-aprendizaje`).request.body).toEqual({ id_sesion: 's-1' });
    api.obtener('plan-1').subscribe();
    esperar('GET', `${API}/plan-aprendizaje/plan-1`).flush(planPrueba());
  });

  it('ActividadApiService', () => {
    TestBed.inject(ActividadApiService).actualizar('a-1', { estado: 'COMPLETADA' }).subscribe();
    expect(esperar('PATCH', `${API}/actividades/a-1`).request.body).toEqual({
      estado: 'COMPLETADA',
    });
  });

  it('ArchivoApiService sube multipart con progreso', () => {
    const api = TestBed.inject(ArchivoApiService);
    const eventos: EventoSubida[] = [];
    api
      .subir(new File(['hola'], 'resumen.txt', { type: 'text/plain' }), 'ACTIVIDAD', 'a-1')
      .subscribe((e) => eventos.push(e));
    const req = esperar('POST', `${API}/archivos`);
    const cuerpo = req.request.body as FormData;
    expect(cuerpo.get('contexto')).toBe('ACTIVIDAD');
    expect(cuerpo.get('id_contexto')).toBe('a-1');
    req.event({ type: HttpEventType.UploadProgress, loaded: 50, total: 100 });
    req.flush({ id_archivo: 'ar-1', nombre: 'resumen.txt', mime: 'text/plain', tamano_bytes: 4 });
    expect(eventos[0]).toEqual({ tipo: 'progreso', porcentaje: 50 });
    expect(eventos.at(-1)?.tipo).toBe('completado');

    api.eliminar('ar-1').subscribe();
    esperar('DELETE', `${API}/archivos/ar-1`);
    expect(api.urlContenido('ar-1')).toBe(`${API}/archivos/ar-1/contenido`);
  });

  it('VisualApiService', () => {
    TestBed.inject(VisualApiService).consultar('m-1').subscribe();
    esperar('GET', `${API}/mensajes/m-1/visual`);
  });

  it('HistorialApiService', () => {
    TestBed.inject(HistorialApiService).listar('u-1', 2, 10).subscribe();
    esperar('GET', `${API}/historial/u-1?pagina=2&tamano=10`);
  });

  it('PerfilApiService', () => {
    const api = TestBed.inject(PerfilApiService);
    api.obtener('u-1').subscribe();
    esperar('GET', `${API}/perfil/u-1`);
    api
      .actualizar('u-1', { nombre: 'Ana', tipo_nivel: 'COLEGIO', nivel_educativo: '9' })
      .subscribe();
    esperar('PUT', `${API}/perfil/u-1`);
    api.desactivar('u-1').subscribe();
    esperar('DELETE', `${API}/perfil/u-1`);
  });

  it('SuscripcionApiService', () => {
    const api = TestBed.inject(SuscripcionApiService);
    api.obtener().subscribe();
    esperar('GET', `${API}/suscripcion`);
    api.iniciarCheckout().subscribe();
    esperar('POST', `${API}/suscripcion/checkout`);
    api.descargarReporte().subscribe();
    expect(esperar('GET', `${API}/reportes/progreso?formato=csv`).request.responseType).toBe(
      'blob',
    );
  });
});
