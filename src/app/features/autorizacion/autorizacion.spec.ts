import { Location } from '@angular/common';
import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { cuerpoError } from '../../../testing/datos-prueba';
import { API, proveedoresHttpPrueba } from '../../../testing/proveedores-prueba';
import { AutorizacionPublica } from '../../core/models';
import { ConfirmarAutorizacionPageComponent } from './confirmar-autorizacion-page/confirmar-autorizacion-page.component';
import { leerTokenDeFragmento } from './leer-token';

const TOKEN = 'tok_abcdefghijklmnopqrstuvwxyz';
const INVALIDO = 'Este enlace ya no es válido';

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

  function autorizacion(
    estado: AutorizacionPublica['estado'],
    cambios: Partial<AutorizacionPublica> = {},
  ): AutorizacionPublica {
    return {
      estado,
      nombre_estudiante: 'Laura',
      correo_estudiante_enmascarado: 'l***@correo.com',
      texto_consentimiento: 'Como representante legal autorizo el tratamiento de sus datos.',
      version_politica: '1',
      fecha_expiracion_token: '2026-10-25T00:00:00Z',
      ...cambios,
    };
  }

  async function abrir(datos: AutorizacionPublica) {
    const fixture = await crear(`token=${TOKEN}`);
    backend.expectOne(`${API}/autorizaciones/consultar`).flush(datos);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  function boton(el: HTMLElement, texto: string): HTMLButtonElement {
    return [...el.querySelectorAll<HTMLButtonElement>('button')].find(
      (b) => b.textContent?.trim() === texto,
    ) as HTMLButtonElement;
  }

  afterEach(() => backend.verify());

  it('lee el token del fragmento, lo borra de la URL y no lo guarda ni lo registra', async () => {
    const guardar = vi.spyOn(Storage.prototype, 'setItem');
    const registro = vi.spyOn(console, 'log');
    const fixture = await crear(`token=${TOKEN}`);
    expect(location.replaceState).toHaveBeenCalledWith('/autorizacion/confirmar');
    const req = backend.expectOne(`${API}/autorizaciones/consultar`);
    expect(req.request.body).toEqual({ token: TOKEN });
    expect(req.request.withCredentials).toBe(false);
    req.flush(autorizacion('PENDIENTE'));
    await fixture.whenStable();
    expect(guardar).not.toHaveBeenCalled();
    expect(registro.mock.calls.flat().join(' ')).not.toContain(TOKEN);
  });

  it('PENDIENTE: nombre, correo enmascarado, resumen, texto legal del backend y solo dos botones', async () => {
    const { el } = await abrir(autorizacion('PENDIENTE'));
    expect(el.querySelector('h1')?.textContent).toContain('Laura necesita tu autorización');
    expect(el.textContent).toContain('l***@correo.com');
    expect(el.querySelectorAll('.adulto__resumen li')).toHaveLength(3);
    expect(el.textContent).toContain('Como representante legal autorizo el tratamiento');
    expect(el.querySelector('a[href="/politica"]')?.getAttribute('target')).toBe('_blank');
    const botones = [...el.querySelectorAll('button')].filter((b) => !b.closest('dialog'));
    expect(botones.map((b) => b.textContent?.trim())).toEqual(['Autorizo', 'No autorizo']);
    const campos = [...el.querySelectorAll('input, select, textarea')].filter(
      (c) => !c.closest('dialog'),
    );
    expect(campos).toHaveLength(0);
  });

  it('Autorizo envía token y versión; deshabilita ambos botones mientras tanto', async () => {
    const { fixture, el } = await abrir(autorizacion('PENDIENTE', { version_politica: '1.2' }));
    boton(el, 'Autorizo').click();
    await fixture.whenStable();
    expect(boton(el, 'Autorizo').disabled).toBe(true);
    expect(boton(el, 'No autorizo').disabled).toBe(true);
    const req = backend.expectOne(`${API}/autorizaciones/confirmar`);
    expect(req.request.body).toEqual({ token: TOKEN, version_politica: '1.2' });
    req.flush(autorizacion('AUTORIZADA'));
    await fixture.whenStable();
    expect(el.textContent).toContain('¡Listo! Laura ya puede usar TutorIA');
    expect(boton(el, 'Retirar autorización')).toBeDefined();
  });

  it('No autorizo llama a rechazar con el token', async () => {
    const { fixture, el } = await abrir(autorizacion('PENDIENTE'));
    boton(el, 'No autorizo').click();
    const req = backend.expectOne(`${API}/autorizaciones/rechazar`);
    expect(req.request.body).toEqual({ token: TOKEN });
    req.flush(autorizacion('RECHAZADA'));
    await fixture.whenStable();
    expect(el.textContent).toContain('Entendido. No activaremos la cuenta.');
  });

  it('si la política cambió, recarga el texto nuevo antes de volver a pedir el clic', async () => {
    const { fixture, el } = await abrir(autorizacion('PENDIENTE'));
    boton(el, 'Autorizo').click();
    backend
      .expectOne(`${API}/autorizaciones/confirmar`)
      .flush(cuerpoError('POLITICA_DESACTUALIZADA'), { status: 409, statusText: '' });
    backend.expectOne(`${API}/autorizaciones/consultar`).flush(
      autorizacion('PENDIENTE', {
        version_politica: '2',
        texto_consentimiento: 'Texto legal nuevo.',
      }),
    );
    await fixture.whenStable();
    expect(el.textContent).toContain('Texto legal nuevo.');
    expect(el.textContent).toContain('se acaba de actualizar');
    boton(el, 'Autorizo').click();
    expect(backend.expectOne(`${API}/autorizaciones/confirmar`).request.body).toEqual({
      token: TOKEN,
      version_politica: '2',
    });
  });

  it('AUTORIZADA: retirar abre el diálogo con la opción de eliminar sus datos', async () => {
    const { fixture, el } = await abrir(autorizacion('AUTORIZADA'));
    boton(el, 'Retirar autorización').click();
    await fixture.whenStable();
    el.querySelector<HTMLInputElement>('#revocar-eliminar-datos')?.click();
    await fixture.whenStable();
    const confirmar = [...el.querySelectorAll<HTMLButtonElement>('dialog[open] button')].find((b) =>
      b.textContent?.includes('Retirar autorización'),
    ) as HTMLButtonElement;
    confirmar.click();
    const req = backend.expectOne(`${API}/autorizaciones/revocar`);
    expect(req.request.body).toEqual({ token: TOKEN, eliminar_datos: true });
    req.flush(autorizacion('REVOCADA'));
    await fixture.whenStable();
    expect(el.textContent).toContain('Retiraste la autorización');
  });

  it.each(['REVOCADA', 'EXPIRADA'] as const)(
    '%s muestra que el enlace ya no es válido, sin formulario',
    async (estado) => {
      const { el } = await abrir(autorizacion(estado));
      expect(el.textContent).toContain(INVALIDO);
      expect(el.querySelector('a[href="/autorizacion"], form')).toBeNull();
    },
  );

  it('AUTORIZACION_INVALIDA muestra el mensaje amable sin formulario', async () => {
    const fixture = await crear(`token=${TOKEN}`);
    backend
      .expectOne(`${API}/autorizaciones/consultar`)
      .flush(cuerpoError('AUTORIZACION_INVALIDA'), { status: 404, statusText: '' });
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(INVALIDO);
    expect(el.querySelector('a[href="/autorizacion"], form')).toBeNull();
  });

  it('sin token muestra el mensaje y no llama a la API', async () => {
    const fixture = await crear(null);
    await fixture.whenStable();
    backend.expectNone(`${API}/autorizaciones/consultar`);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(INVALIDO);
  });

  it('leerTokenDeFragmento rechaza tokens raros', () => {
    expect(leerTokenDeFragmento(`token=${TOKEN}`)).toBe(TOKEN);
    expect(leerTokenDeFragmento('#token=corto')).toBeNull();
    expect(leerTokenDeFragmento('token=<script>alert(1)</script>xxxxxxxxxx')).toBeNull();
    expect(leerTokenDeFragmento(null)).toBeNull();
  });
});
