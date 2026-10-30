import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { cuerpoError, politicaPrueba, usuarioPrueba } from '../../../../testing/datos-prueba';
import { API, proveedoresHttpPrueba } from '../../../../testing/proveedores-prueba';
import { RegistroPageComponent } from './registro-page.component';

describe('RegistroPageComponent', () => {
  let fixture: ComponentFixture<RegistroPageComponent>;
  let backend: HttpTestingController;
  let el: HTMLElement;

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 18));
    TestBed.configureTestingModule({
      imports: [RegistroPageComponent],
      providers: proveedoresHttpPrueba(),
    });
    backend = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(RegistroPageComponent);
    fixture.detectChanges();
    backend.expectOne(`${API}/politica-tratamiento`).flush(politicaPrueba({ version: '1.2' }));
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => {
    vi.useRealTimers();
    backend.verify();
  });

  function escribir(selector: string, valor: string): void {
    const campo = el.querySelector<HTMLInputElement | HTMLSelectElement>(selector);
    if (!campo) {
      throw new Error(selector);
    }
    campo.value = valor;
    campo.dispatchEvent(new Event(campo instanceof HTMLSelectElement ? 'change' : 'input'));
  }

  async function llenarDatos(fecha: string): Promise<void> {
    escribir('#registro-nombre', 'Laura Gómez');
    escribir('#registro-correo', 'Laura@Correo.com');
    escribir('#registro-contrasena', 'clave1234');
    escribir('#registro-fecha', fecha);
    el.querySelector<HTMLInputElement>('input[value=COLEGIO]')?.click();
    await fixture.whenStable();
    escribir('#registro-nivel', '10');
    await fixture.whenStable();
  }

  function marcar(id: string): void {
    el.querySelector<HTMLInputElement>(`#${id}`)?.click();
  }

  function botonRegistro(): HTMLButtonElement {
    return el.querySelector<HTMLButtonElement>('button[type=submit]') as HTMLButtonElement;
  }

  it('ninguna casilla de autorización viene premarcada y muestra los textos del backend', () => {
    const casillas = el.querySelectorAll<HTMLInputElement>(
      'app-casilla-consentimiento input[type=checkbox]',
    );
    expect(casillas.length).toBe(4);
    expect([...casillas].every((c) => !c.checked)).toBe(true);
    expect(el.textContent).toContain('Autorizo el tratamiento de mis datos.');
    expect(el.textContent).toContain('Anthropic, OpenAI y AWS');
    expect(el.textContent).toContain('1.2');
    expect(el.querySelector('a[href="/politica"]')).not.toBeNull();
  });

  it('el botón sigue deshabilitado hasta marcar las dos obligatorias', async () => {
    expect(botonRegistro().disabled).toBe(true);
    marcar('registro-tratamiento');
    await fixture.whenStable();
    expect(botonRegistro().disabled).toBe(true);
    marcar('registro-transferencia');
    await fixture.whenStable();
    expect(botonRegistro().disabled).toBe(false);
  });

  it('envía version_politica y los consentimientos; un adulto entra a /tema', async () => {
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    await llenarDatos('2000-05-10');
    marcar('registro-tratamiento');
    marcar('registro-transferencia');
    marcar('registro-comunicaciones');
    await fixture.whenStable();
    botonRegistro().click();

    const req = backend.expectOne(`${API}/auth/registro`);
    expect(req.request.body).toEqual({
      nombre: 'Laura Gómez',
      correo: 'laura@correo.com',
      contrasena: 'clave1234',
      fecha_nacimiento: '2000-05-10',
      tipo_nivel: 'COLEGIO',
      nivel_educativo: '10',
      version_politica: '1.2',
      acepta_tratamiento: true,
      acepta_transferencia_internacional: true,
      acepta_personalizacion: false,
      acepta_comunicaciones: true,
    });
    req.flush(usuarioPrueba());
    expect(navegar).toHaveBeenCalledWith('/tema');
  });

  it('si es menor muestra el aviso y la casilla de opinión, y luego va a /pendiente-autorizacion', async () => {
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    await llenarDatos('2011-03-01');
    expect(el.textContent).toContain('un adulto responsable debe autorizar tu cuenta');
    expect(el.querySelector('#registro-menor')).not.toBeNull();
    expect((el.querySelector('#registro-menor') as HTMLInputElement).checked).toBe(false);

    marcar('registro-tratamiento');
    marcar('registro-transferencia');
    marcar('registro-menor');
    await fixture.whenStable();
    botonRegistro().click();
    const req = backend.expectOne(`${API}/auth/registro`);
    expect(req.request.body.entiende_datos_menor).toBe(true);
    req.flush(usuarioPrueba({ es_menor: true, estado_cuenta: 'PENDIENTE_AUTORIZACION' }));
    expect(navegar).toHaveBeenCalledWith('/pendiente-autorizacion');
  });

  it('CONSENTIMIENTO_REQUERIDO marca la casilla faltante', async () => {
    await llenarDatos('2000-05-10');
    marcar('registro-tratamiento');
    marcar('registro-transferencia');
    await fixture.whenStable();
    botonRegistro().click();
    backend
      .expectOne(`${API}/auth/registro`)
      .flush(
        cuerpoError('CONSENTIMIENTO_REQUERIDO', 'Falta', {
          finalidades: ['TRANSFERENCIA_INTERNACIONAL'],
        }),
        {
          status: 422,
          statusText: '',
        },
      );
    await fixture.whenStable();
    expect(el.querySelector('#registro-transferencia')?.getAttribute('aria-invalid')).toBe('true');
    expect(el.querySelector('#registro-tratamiento')?.getAttribute('aria-invalid')).toBeNull();
  });

  it('POLITICA_DESACTUALIZADA recarga la política y desmarca las casillas', async () => {
    await llenarDatos('2000-05-10');
    marcar('registro-tratamiento');
    marcar('registro-transferencia');
    await fixture.whenStable();
    botonRegistro().click();
    backend
      .expectOne(`${API}/auth/registro`)
      .flush(cuerpoError('POLITICA_DESACTUALIZADA'), { status: 409, statusText: '' });
    backend.expectOne(`${API}/politica-tratamiento`).flush(politicaPrueba({ version: '2' }));
    await fixture.whenStable();
    expect(el.textContent).toContain('se acaba de actualizar');
    expect((el.querySelector('#registro-tratamiento') as HTMLInputElement).checked).toBe(false);
    expect(el.textContent).toContain('2');
  });

  it('EDAD_NO_PERMITIDA se muestra junto a la fecha', async () => {
    await llenarDatos('2000-05-10');
    marcar('registro-tratamiento');
    marcar('registro-transferencia');
    await fixture.whenStable();
    botonRegistro().click();
    backend
      .expectOne(`${API}/auth/registro`)
      .flush(cuerpoError('EDAD_NO_PERMITIDA', 'TutorIA está disponible a partir de los 13 años.'), {
        status: 422,
        statusText: '',
      });
    await fixture.whenStable();
    expect(el.querySelector('#registro-fecha-error')?.textContent).toContain('13 años');
  });
});
