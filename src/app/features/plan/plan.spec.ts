import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { cuerpoError, planPrueba } from '../../../testing/datos-prueba';
import { API, proveedoresHttpPrueba } from '../../../testing/proveedores-prueba';
import { PlanDetalle } from '../../core/models';
import { PlanPageComponent } from './plan-page/plan-page.component';

describe('PlanPageComponent', () => {
  let fixture: ComponentFixture<PlanPageComponent>;
  let backend: HttpTestingController;
  let el: HTMLElement;

  async function crear(plan: PlanDetalle) {
    TestBed.configureTestingModule({
      imports: [PlanPageComponent],
      providers: proveedoresHttpPrueba(),
    });
    backend = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(PlanPageComponent);
    fixture.componentRef.setInput('idPlan', 'plan-1');
    fixture.detectChanges();
    backend.expectOne(`${API}/plan-aprendizaje/plan-1`).flush(plan);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  }

  afterEach(() => backend.verify());

  it('en nivel Avanzado muestra el selector de archivo', async () => {
    await crear(planPrueba({ acepta_archivos: true }));
    expect(el.querySelector('app-selector-archivo')).not.toBeNull();
  });

  it('en Básico/Intermedio no muestra el selector', async () => {
    await crear(planPrueba({ acepta_archivos: false, nivel_bloom: 'BASICO' }));
    expect(el.querySelector('app-selector-archivo')).toBeNull();
  });

  it('si validado es false muestra el aviso discreto', async () => {
    await crear(planPrueba({ validado: false }));
    expect(el.textContent).toContain('Este plan no pasó toda nuestra verificación');
  });

  it('guarda la respuesta al salir del campo e indica "Guardado"', async () => {
    await crear(planPrueba());
    const campo = el.querySelector<HTMLTextAreaElement>(
      '#actividad-a-1-respuesta',
    ) as HTMLTextAreaElement;
    campo.value = 'Es una parte de un todo.';
    campo.dispatchEvent(new Event('blur'));
    const req = backend.expectOne(`${API}/actividades/a-1`);
    expect(req.request.body).toEqual({
      estado: 'PENDIENTE',
      respuesta_usuario: 'Es una parte de un todo.',
    });
    req.flush({ ...planPrueba().actividades[0], respuesta_usuario: 'Es una parte de un todo.' });
    await fixture.whenStable();
    expect(el.querySelector('#actividad-a-1-guardado')?.textContent).toContain('Guardado');
  });

  it('sube el archivo y lo asocia a la actividad; ante error lo conserva', async () => {
    await crear(planPrueba());
    const entrada = el.querySelector<HTMLInputElement>('input[type=file]') as HTMLInputElement;
    const archivo = new File(['%PDF-1.4'], 'explicacion.pdf', { type: 'application/pdf' });
    Object.defineProperty(entrada, 'files', { value: { item: () => archivo, length: 1 } });
    entrada.dispatchEvent(new Event('change'));

    backend
      .expectOne(`${API}/archivos`)
      .flush(
        cuerpoError(
          'CONTENIDO_NO_PERMITIDO',
          'El archivo contiene material que no está permitido.',
        ),
        {
          status: 422,
          statusText: '',
        },
      );
    await fixture.whenStable();
    expect(el.textContent).toContain('explicacion.pdf');
    expect(el.querySelector('[role=alert]')?.textContent).toContain('no está permitido');

    [...el.querySelectorAll('button')]
      .find((b) => b.textContent?.includes('Intentar subir de nuevo'))
      ?.click();
    backend
      .expectOne(`${API}/archivos`)
      .flush({
        id_archivo: 'ar-1',
        nombre: 'explicacion.pdf',
        mime: 'application/pdf',
        tamano_bytes: 8,
      });
    const patch = backend.expectOne(`${API}/actividades/a-1`);
    expect(patch.request.body).toEqual({ estado: 'PENDIENTE', id_archivo: 'ar-1' });
    patch.flush({
      ...planPrueba().actividades[0],
      archivo: {
        id_archivo: 'ar-1',
        nombre: 'explicacion.pdf',
        mime: 'application/pdf',
        tamano_bytes: 8,
      },
    });
    backend.expectOne(`${API}/suscripcion`).flush(null);
    await fixture.whenStable();
    expect(el.textContent).toContain('Archivo entregado');
  });
});
