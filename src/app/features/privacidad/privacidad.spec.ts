import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { cuerpoError, politicaPrueba, usuarioPrueba } from '../../../testing/datos-prueba';
import { API, proveedoresHttpPrueba } from '../../../testing/proveedores-prueba';
import { ConsentimientoPublico, MisDatos } from '../../core/models';
import { AceptarPoliticaPageComponent } from './aceptar-politica-page/aceptar-politica-page.component';
import { PrivacidadPageComponent } from './privacidad-page/privacidad-page.component';
import { resumirMisDatos } from './resumir-mis-datos';

const CONSENTIMIENTOS: ConsentimientoPublico[] = [
  {
    finalidad: 'TRATAMIENTO',
    otorgado: true,
    otorgado_por: 'TITULAR',
    version_politica: '1',
    fecha: '2026-10-01T00:00:00Z',
  },
  {
    finalidad: 'PERSONALIZACION',
    otorgado: true,
    otorgado_por: 'TITULAR',
    version_politica: '1',
    fecha: '2026-10-01T00:00:00Z',
  },
  {
    finalidad: 'COMUNICACIONES',
    otorgado: false,
    otorgado_por: 'TITULAR',
    version_politica: '1',
    fecha: '2026-10-01T00:00:00Z',
  },
];

const MIS_DATOS: MisDatos = {
  usuario: { id_usuario: 'u-1', nombre: 'Laura', correo: 'laura@correo.com', es_menor: false },
  perfil_aprendizaje: { resumen: 'Prefiere ejemplos' },
  planes: [{}, {}],
  conversaciones: [{}],
  archivos: [],
  consentimientos: CONSENTIMIENTOS,
  solicitudes: [],
};

describe('PrivacidadPageComponent', () => {
  let fixture: ComponentFixture<PrivacidadPageComponent>;
  let backend: HttpTestingController;
  let el: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [PrivacidadPageComponent],
      providers: proveedoresHttpPrueba(),
    });
    backend = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(PrivacidadPageComponent);
    fixture.detectChanges();
    backend.expectOne(`${API}/politica-tratamiento`).flush(politicaPrueba({ version: '1' }));
    backend.expectOne(`${API}/privacidad/consentimientos`).flush(CONSENTIMIENTOS);
    backend.expectOne(`${API}/privacidad/solicitudes`).flush([]);
    backend.expectOne(`${API}/privacidad/mis-datos`).flush(MIS_DATOS);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => backend.verify());

  function interruptor(texto: string): HTMLButtonElement {
    const caja = [...el.querySelectorAll('app-interruptor')].find((i) =>
      i.textContent?.includes(texto),
    );
    return caja?.querySelector('button[role=switch]') as HTMLButtonElement;
  }

  it('solo las finalidades opcionales tienen interruptor', () => {
    expect(el.querySelectorAll('button[role=switch]')).toHaveLength(2);
    expect(el.textContent).toContain('solicita la eliminación');
  });

  it('activar comunicaciones envía la versión de la política', async () => {
    interruptor('Correos de novedades').click();
    const req = backend.expectOne(`${API}/privacidad/consentimientos`);
    expect(req.request.body).toEqual({
      finalidad: 'COMUNICACIONES',
      otorgado: true,
      version_politica: '1',
    });
    req.flush({ ...CONSENTIMIENTOS[2], otorgado: true });
    await fixture.whenStable();
    expect(interruptor('Correos de novedades').getAttribute('aria-checked')).toBe('true');
  });

  it('desactivar la personalización pide confirmación antes', async () => {
    interruptor('Personalización').click();
    await fixture.whenStable();
    backend.expectNone(`${API}/privacidad/consentimientos`);
    const dialogo = el.querySelector('dialog[open]');
    expect(dialogo?.textContent).toContain('Desactivar la personalización');
    [...(dialogo?.querySelectorAll('button') ?? [])]
      .find((b) => b.textContent?.trim() === 'Desactivar')
      ?.click();
    const req = backend.expectOne(`${API}/privacidad/consentimientos`);
    expect(req.request.body.otorgado).toBe(false);
    req.flush({ ...CONSENTIMIENTOS[1], otorgado: false });
  });

  it('muestra mis datos en lenguaje claro y los descarga en JSON', async () => {
    expect(el.textContent).toContain('laura@correo.com');
    expect(el.textContent).toContain('2 planes');
    let descargado = '';
    const clic = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      descargado = this.download;
    });
    [...el.querySelectorAll('button')]
      .find((b) => b.textContent?.includes('Descargar mis datos'))
      ?.click();
    backend.expectOne(`${API}/privacidad/mis-datos/exportar`).flush(new Blob(['{}']));
    expect(clic).toHaveBeenCalled();
    expect(descargado).toMatch(/^mis-datos-tutoria-.*\.json$/);
    clic.mockRestore();
  });

  it('crea una solicitud y muestra la fecha límite', async () => {
    const detalle = el.querySelector<HTMLTextAreaElement>(
      '#solicitud-detalle',
    ) as HTMLTextAreaElement;
    detalle.value = 'Quiero saber qué datos tienen de mí.';
    detalle.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    [...el.querySelectorAll('button')]
      .find((b) => b.textContent?.includes('Enviar solicitud'))
      ?.click();
    const req = backend.expectOne(`${API}/privacidad/solicitudes`);
    expect(req.request.body).toEqual({
      tipo: 'CONSULTA',
      detalle: 'Quiero saber qué datos tienen de mí.',
    });
    req.flush({
      id_solicitud: 'sol-1',
      tipo: 'CONSULTA',
      estado: 'RECIBIDA',
      fecha_limite: '2026-11-01',
    });
    await fixture.whenStable();
    expect(el.textContent).toContain('Responderemos antes del');
    expect(el.textContent).toContain('Recibida');
  });

  it('eliminar la cuenta pide confirmación y crea una solicitud de SUPRESION', async () => {
    [...el.querySelectorAll('button')]
      .find((b) => b.textContent?.includes('Solicitar la eliminación'))
      ?.click();
    await fixture.whenStable();
    expect(el.querySelector('dialog[open]')?.textContent).toContain(
      'Conservaremos solo lo que la ley',
    );
    [...el.querySelectorAll<HTMLButtonElement>('dialog[open] button')]
      .find((b) => b.textContent?.includes('Sí, solicitar'))
      ?.click();
    const req = backend.expectOne(`${API}/privacidad/solicitudes`);
    expect(req.request.body.tipo).toBe('SUPRESION');
    req.flush({
      id_solicitud: 'sol-2',
      tipo: 'SUPRESION',
      estado: 'RECIBIDA',
      fecha_limite: '2026-11-01',
    });
  });
});

describe('AceptarPoliticaPageComponent', () => {
  it('muestra la versión vigente, casillas desmarcadas y acepta', async () => {
    TestBed.configureTestingModule({
      imports: [AceptarPoliticaPageComponent],
      providers: proveedoresHttpPrueba(),
    });
    const backend = TestBed.inject(HttpTestingController);
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(AceptarPoliticaPageComponent);
    fixture.componentRef.setInput('volver', '/plan/1');
    fixture.detectChanges();
    backend.expectOne(`${API}/politica-tratamiento`).flush(politicaPrueba({ version: '2' }));
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const boton = el.querySelector<HTMLButtonElement>('button[type=submit]') as HTMLButtonElement;

    expect(el.textContent).toContain('Versión 2');
    expect(
      [...el.querySelectorAll<HTMLInputElement>('input[type=checkbox]')].every((c) => !c.checked),
    ).toBe(true);
    expect(boton.disabled).toBe(true);

    el.querySelector<HTMLInputElement>('#aceptar-tratamiento')?.click();
    el.querySelector<HTMLInputElement>('#aceptar-transferencia')?.click();
    await fixture.whenStable();
    expect(boton.disabled).toBe(false);
    boton.click();

    const req = backend.expectOne(`${API}/privacidad/aceptar-politica`);
    expect(req.request.body).toEqual({
      version_politica: '2',
      acepta_tratamiento: true,
      acepta_transferencia_internacional: true,
    });
    req.flush(null);
    expect(navegar).toHaveBeenCalledWith('/plan/1');
  });

  it('si la versión cambió de nuevo, recarga la política', async () => {
    TestBed.configureTestingModule({
      imports: [AceptarPoliticaPageComponent],
      providers: proveedoresHttpPrueba(),
    });
    const backend = TestBed.inject(HttpTestingController);
    const { SesionService } = await import('../../core/auth/sesion.service');
    TestBed.inject(SesionService).establecer(usuarioPrueba());
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(AceptarPoliticaPageComponent);
    fixture.detectChanges();
    backend.expectOne(`${API}/politica-tratamiento`).flush(politicaPrueba({ version: '2' }));
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    el.querySelector<HTMLInputElement>('#aceptar-tratamiento')?.click();
    el.querySelector<HTMLInputElement>('#aceptar-transferencia')?.click();
    await fixture.whenStable();
    el.querySelector<HTMLButtonElement>('button[type=submit]')?.click();
    backend
      .expectOne(`${API}/privacidad/aceptar-politica`)
      .flush(cuerpoError('POLITICA_DESACTUALIZADA'), { status: 409, statusText: '' });
    backend.expectOne(`${API}/politica-tratamiento`).flush(politicaPrueba({ version: '3' }));
    await fixture.whenStable();
    expect(el.textContent).toContain('Versión 3');
  });
});

describe('resumirMisDatos', () => {
  it('omite claves técnicas y cuenta el contenido', () => {
    const r = resumirMisDatos(MIS_DATOS);
    expect(r.cuenta.find((f) => f.etiqueta === 'Correo')?.valor).toBe('laura@correo.com');
    expect(r.cuenta.some((f) => f.etiqueta.includes('id'))).toBe(false);
    expect(r.contenido[1]?.valor).toBe('1 conversación');
  });
});
