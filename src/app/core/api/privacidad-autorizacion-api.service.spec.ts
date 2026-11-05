import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API, proveedoresHttpPrueba } from '../../../testing/proveedores-prueba';
import { AutorizacionApiService } from './autorizacion-api.service';
import { PrivacidadApiService } from './privacidad-api.service';

describe('PrivacidadApiService', () => {
  let backend: HttpTestingController;
  let api: PrivacidadApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: proveedoresHttpPrueba() });
    backend = TestBed.inject(HttpTestingController);
    api = TestBed.inject(PrivacidadApiService);
  });

  afterEach(() => backend.verify());

  function esperar(metodo: string, url: string, credenciales: boolean): TestRequest {
    const req = backend.expectOne((r) => r.urlWithParams === url);
    expect(req.request.method).toBe(metodo);
    expect(req.request.withCredentials).toBe(credenciales);
    return req;
  }

  it('la política y el cumplimiento son públicos (sin cookie)', () => {
    api.politica().subscribe();
    esperar('GET', `${API}/politica-tratamiento`, false);
    api.cumplimiento().subscribe();
    esperar('GET', `${API}/cumplimiento`, false);
  });

  it('consentimientos, mis datos y solicitudes usan la sesión', () => {
    api.consentimientos().subscribe();
    esperar('GET', `${API}/privacidad/consentimientos`, true);
    api
      .cambiarConsentimiento({ finalidad: 'COMUNICACIONES', otorgado: true, version_politica: '1' })
      .subscribe();
    expect(esperar('POST', `${API}/privacidad/consentimientos`, true).request.body).toEqual({
      finalidad: 'COMUNICACIONES',
      otorgado: true,
      version_politica: '1',
    });
    api
      .aceptarPolitica({
        version_politica: '2',
        acepta_tratamiento: true,
        acepta_transferencia_internacional: true,
      })
      .subscribe();
    esperar('POST', `${API}/privacidad/aceptar-politica`, true);
    api.misDatos().subscribe();
    esperar('GET', `${API}/privacidad/mis-datos`, true);
    api.exportar().subscribe();
    expect(esperar('GET', `${API}/privacidad/mis-datos/exportar`, true).request.responseType).toBe(
      'blob',
    );
    api.crearSolicitud({ tipo: 'SUPRESION', detalle: 'Eliminar mis datos' }).subscribe();
    esperar('POST', `${API}/privacidad/solicitudes`, true);
    api.solicitudes().subscribe();
    esperar('GET', `${API}/privacidad/solicitudes`, true);
  });
});

describe('AutorizacionApiService', () => {
  let backend: HttpTestingController;
  let api: AutorizacionApiService;
  const token = 'tok_abcdefghijklmnopqrstuvwxyz';

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: proveedoresHttpPrueba() });
    backend = TestBed.inject(HttpTestingController);
    api = TestBed.inject(AutorizacionApiService);
  });

  afterEach(() => backend.verify());

  function esperarPublico(url: string): TestRequest {
    const req = backend.expectOne(url);
    expect(req.request.method).toBe('POST');
    // Pantallas del acudiente: nunca envían la cookie de sesión.
    expect(req.request.withCredentials).toBe(false);
    return req;
  }

  it('mia y reenviar usan la sesión del estudiante', () => {
    api.mia().subscribe();
    const mia = backend.expectOne(`${API}/autorizaciones/mia`);
    expect(mia.request.method).toBe('GET');
    expect(mia.request.withCredentials).toBe(true);

    api.reenviar().subscribe();
    const mismo = backend.expectOne(`${API}/autorizaciones/reenviar`);
    expect(mismo.request.body).toEqual({});
    expect(mismo.request.withCredentials).toBe(true);

    api.reenviar('papa@correo.com').subscribe();
    expect(backend.expectOne(`${API}/autorizaciones/reenviar`).request.body).toEqual({
      correo_acudiente: 'papa@correo.com',
    });
  });

  it('el token viaja solo en el cuerpo del POST, nunca en la URL', () => {
    api.consultar(token).subscribe();
    const consulta = esperarPublico(`${API}/autorizaciones/consultar`);
    expect(consulta.request.body).toEqual({ token });
    expect(consulta.request.urlWithParams).not.toContain(token);
    api.confirmar(token, '1.2').subscribe();
    expect(esperarPublico(`${API}/autorizaciones/confirmar`).request.body).toEqual({
      token,
      version_politica: '1.2',
    });
    api.rechazar(token).subscribe();
    expect(esperarPublico(`${API}/autorizaciones/rechazar`).request.body).toEqual({ token });
    api.revocar(token, true).subscribe();
    expect(esperarPublico(`${API}/autorizaciones/revocar`).request.body).toEqual({
      token,
      eliminar_datos: true,
    });
  });
});
