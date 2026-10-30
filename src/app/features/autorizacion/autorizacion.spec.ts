import { Location } from '@angular/common';
import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { cuerpoError, politicaPrueba } from '../../../testing/datos-prueba';
import { API, proveedoresHttpPrueba } from '../../../testing/proveedores-prueba';
import { AutorizacionPublica } from '../../core/models';
import { ConfirmarAutorizacionPageComponent } from './confirmar-autorizacion-page/confirmar-autorizacion-page.component';
import { leerTokenDeFragmento } from './leer-token';
import { PrellenadoAutorizacionService } from './prellenado-autorizacion.service';
import { SolicitarAutorizacionPageComponent } from './solicitar-autorizacion-page/solicitar-autorizacion-page.component';

const TOKEN = 'tok_abcdefghijklmnopqrstuvwxyz';

describe('SolicitarAutorizacionPageComponent', () => {
  let backend: HttpTestingController;

  async function crear() {
    TestBed.configureTestingModule({
      imports: [SolicitarAutorizacionPageComponent],
      providers: proveedoresHttpPrueba(),
    });
    backend = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(SolicitarAutorizacionPageComponent);
    return fixture;
  }

  async function iniciar(fixture: Awaited<ReturnType<typeof crear>>) {
    fixture.detectChanges();
    backend.expectOne(`${API}/politica-tratamiento`).flush(politicaPrueba());
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  function escribir(el: HTMLElement, id: string, valor: string): void {
    const campo = el.querySelector<HTMLInputElement>(`#${id}`) as HTMLInputElement;
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
  }

  it('solo pide los dos correos y las casillas, todas desmarcadas', async () => {
    const fixture = await crear();
    const el = await iniciar(fixture);
    expect(el.querySelectorAll('input[type=email]')).toHaveLength(2);
    const casillas = el.querySelectorAll<HTMLInputElement>('input[type=checkbox]');
    expect(casillas).toHaveLength(4);
    expect([...casillas].every((c) => !c.checked)).toBe(true);
    expect(el.querySelector('input[type=password]')).toBeNull();
    expect(el.querySelector('input[type=date]')).toBeNull();
    expect(el.textContent).toContain('El mismo correo con el que el estudiante se registró');
  });

  it('exige las casillas obligatorias y correos distintos', async () => {
    const fixture = await crear();
    const el = await iniciar(fixture);
    escribir(el, 'autorizacion-correo-acudiente', 'mama@correo.com');
    escribir(el, 'autorizacion-correo-estudiante', 'mama@correo.com');
    el.querySelector<HTMLButtonElement>('button[type=submit]')?.click();
    await fixture.whenStable();
    backend.expectNone(`${API}/autorizaciones`);
    expect(el.textContent).toContain('debe ser distinto');
    expect(el.querySelector('#autorizacion-declaracion')?.getAttribute('aria-invalid')).toBe(
      'true',
    );
  });

  it('muestra siempre el mismo mensaje genérico al enviar', async () => {
    const fixture = await crear();
    TestBed.inject(PrellenadoAutorizacionService).establecer('hijo@correo.com');
    const el = await iniciar(fixture);
    expect((el.querySelector('#autorizacion-correo-estudiante') as HTMLInputElement).value).toBe(
      'hijo@correo.com',
    );

    escribir(el, 'autorizacion-correo-acudiente', 'Mama@Correo.com');
    for (const id of [
      'autorizacion-declaracion',
      'autorizacion-tratamiento',
      'autorizacion-transferencia',
    ]) {
      el.querySelector<HTMLInputElement>(`#${id}`)?.click();
    }
    await fixture.whenStable();
    el.querySelector<HTMLButtonElement>('button[type=submit]')?.click();
    const req = backend.expectOne(`${API}/autorizaciones`);
    expect(req.request.withCredentials).toBe(false);
    expect(req.request.body).toEqual({
      correo_acudiente: 'mama@correo.com',
      correo_estudiante: 'hijo@correo.com',
      declara_representante_legal: true,
      version_politica: '1',
      acepta_tratamiento: true,
      acepta_transferencia_internacional: true,
      permite_compras: false,
    });
    req.flush({ mensaje: 'ok' });
    await fixture.whenStable();
    expect(el.textContent).toContain(
      'Si los datos son correctos, enviamos un correo al adulto responsable',
    );
    expect(el.textContent).toContain('spam');
  });
});

describe('ConfirmarAutorizacionPageComponent', () => {
  let backend: HttpTestingController;
  let location: Location;

  async function crear(fragmento: string | null) {
    TestBed.configureTestingModule({
      imports: [ConfirmarAutorizacionPageComponent],
      providers: [
        ...proveedoresHttpPrueba(),
        { provide: ActivatedRoute, useValue: { snapshot: { fragment: fragmento } } },
      ],
    });
    backend = TestBed.inject(HttpTestingController);
    location = TestBed.inject(Location);
    vi.spyOn(location, 'path').mockReturnValue('/autorizacion/confirmar');
    vi.spyOn(location, 'replaceState');
    const fixture = TestBed.createComponent(ConfirmarAutorizacionPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  function autorizacion(estado: AutorizacionPublica['estado']): AutorizacionPublica {
    return {
      estado,
      correo_estudiante_enmascarado: 'h***@correo.com',
      permite_compras: false,
      fecha_expiracion_token: '2026-10-25T00:00:00Z',
    };
  }

  it('lee el token del fragmento, lo borra de la URL y lo envía por POST', async () => {
    const guardar = vi.spyOn(Storage.prototype, 'setItem');
    const fixture = await crear(`token=${TOKEN}`);
    expect(location.replaceState).toHaveBeenCalledWith('/autorizacion/confirmar');
    const req = backend.expectOne(`${API}/autorizaciones/consultar`);
    expect(req.request.body).toEqual({ token: TOKEN });
    req.flush(autorizacion('PENDIENTE_VERIFICACION'));
    await fixture.whenStable();
    expect(guardar).not.toHaveBeenCalled();
  });

  it('PENDIENTE: muestra el correo enmascarado, qué autoriza y permite autorizar', async () => {
    const fixture = await crear(`token=${TOKEN}`);
    backend
      .expectOne(`${API}/autorizaciones/consultar`)
      .flush(autorizacion('PENDIENTE_VERIFICACION'));
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('h***@correo.com');
    expect(el.textContent).toContain('inteligencia artificial');
    expect(el.textContent).toContain('No permitiste que el estudiante contrate planes de pago.');

    [...el.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Autorizar')?.click();
    backend.expectOne(`${API}/autorizaciones/confirmar`).flush(autorizacion('AUTORIZADA'));
    await fixture.whenStable();
    expect(el.textContent).toContain('La cuenta está autorizada');
  });

  it('AUTORIZADA: permite revocar con la opción de eliminar datos', async () => {
    const fixture = await crear(`token=${TOKEN}`);
    backend.expectOne(`${API}/autorizaciones/consultar`).flush(autorizacion('AUTORIZADA'));
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    [...el.querySelectorAll('button')]
      .find((b) => b.textContent?.includes('Revocar autorización'))
      ?.click();
    await fixture.whenStable();
    el.querySelector<HTMLInputElement>('#revocar-eliminar-datos')?.click();
    await fixture.whenStable();
    const confirmar = [...el.querySelectorAll<HTMLButtonElement>('dialog[open] button')].find((b) =>
      b.textContent?.includes('Revocar autorización'),
    ) as HTMLButtonElement;
    confirmar.click();
    const req = backend.expectOne(`${API}/autorizaciones/revocar`);
    expect(req.request.body).toEqual({ token: TOKEN, eliminar_datos: true });
    req.flush(autorizacion('REVOCADA'));
    await fixture.whenStable();
    expect(el.textContent).toContain('fue revocada');
  });

  it('REVOCADA y AUTORIZACION_INVALIDA ofrecen pedir un enlace nuevo', async () => {
    const fixture = await crear(`token=${TOKEN}`);
    backend
      .expectOne(`${API}/autorizaciones/consultar`)
      .flush(cuerpoError('AUTORIZACION_INVALIDA'), { status: 404, statusText: '' });
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('no es válido o ya venció');
    expect(el.querySelector('a[href="/autorizacion"]')).not.toBeNull();
  });

  it('sin token muestra enlace inválido y no llama a la API', async () => {
    const fixture = await crear(null);
    await fixture.whenStable();
    backend.expectNone(`${API}/autorizaciones/consultar`);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Este enlace no es válido',
    );
  });

  it('leerTokenDeFragmento rechaza tokens raros', () => {
    expect(leerTokenDeFragmento(`token=${TOKEN}`)).toBe(TOKEN);
    expect(leerTokenDeFragmento('#token=corto')).toBeNull();
    expect(leerTokenDeFragmento('token=<script>alert(1)</script>xxxxxxxxxx')).toBeNull();
    expect(leerTokenDeFragmento(null)).toBeNull();
  });
});
