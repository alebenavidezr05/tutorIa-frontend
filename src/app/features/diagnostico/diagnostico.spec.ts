import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { cuestionarioPrueba, cuerpoError } from '../../../testing/datos-prueba';
import { API, proveedoresHttpPrueba } from '../../../testing/proveedores-prueba';
import { construirRevision } from './construir-revision';
import { CuestionarioPageComponent } from './cuestionario-page/cuestionario-page.component';
import { FlujoDiagnosticoService } from './flujo-diagnostico.service';

describe('FlujoDiagnosticoService', () => {
  let flujo: FlujoDiagnosticoService;

  beforeEach(() => {
    flujo = TestBed.inject(FlujoDiagnosticoService);
    flujo.iniciar(cuestionarioPrueba());
  });

  it('ordena las preguntas por `orden` y empieza en la primera', () => {
    expect(flujo.preguntas().map((p) => p.id_pregunta)).toEqual(['p-1', 'p-2', 'p-3']);
    expect(flujo.preguntaActual()?.id_pregunta).toBe('p-1');
    expect(flujo.esPrimera()).toBe(true);
  });

  it('no avanza sin respuesta y guarda las respuestas parciales', () => {
    flujo.siguiente();
    expect(flujo.indice()).toBe(0);
    flujo.responder('a');
    flujo.siguiente();
    expect(flujo.indice()).toBe(1);
    flujo.anterior();
    expect(flujo.respuestaActual()).toBe('a');
  });

  it('completo y respuestasLista cuando se responde todo', () => {
    for (const letra of ['a', 'a', 'b'] as const) {
      flujo.responder(letra);
      flujo.siguiente();
    }
    expect(flujo.esUltima()).toBe(true);
    expect(flujo.completo()).toBe(true);
    expect(flujo.respuestasLista()).toEqual([
      { id_pregunta: 'p-1', respuesta: 'a' },
      { id_pregunta: 'p-2', respuesta: 'a' },
      { id_pregunta: 'p-3', respuesta: 'b' },
    ]);
  });

  it('iniciar el mismo cuestionario conserva el avance; otro lo reinicia', () => {
    flujo.responder('c');
    flujo.iniciar(cuestionarioPrueba());
    expect(flujo.respuestaActual()).toBe('c');
    flujo.iniciar({ ...cuestionarioPrueba(), id_sesion: 's-2' });
    expect(flujo.respuestaActual()).toBeNull();
  });

  it('construirRevision une resultado y enunciados', () => {
    const revision = construirRevision(flujo.cuestionario(), {
      id_sesion: 's-1',
      nivel_estimado: 'BASICO',
      puntaje: 33,
      aciertos: 1,
      total_preguntas: 3,
      resultados: [
        {
          id_pregunta: 'p-1',
          respuesta_usuario: 'B',
          es_correcta: false,
          respuesta_correcta: 'A',
          fuente: null,
        },
      ],
    });
    expect(revision[0]).toMatchObject({
      enunciado: '¿Qué es una fracción?',
      tuRespuesta: { letra: 'B', texto: 'Todo' },
      correcta: { letra: 'A', texto: 'Parte' },
    });
  });
});

describe('CuestionarioPageComponent', () => {
  let backend: HttpTestingController;

  async function crear() {
    TestBed.configureTestingModule({
      imports: [CuestionarioPageComponent],
      providers: proveedoresHttpPrueba(),
    });
    backend = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(CuestionarioPageComponent);
    fixture.componentRef.setInput('idSesion', 's-1');
    fixture.detectChanges();
    backend.expectOne(`${API}/diagnostico/s-1`).flush(cuestionarioPrueba());
    await fixture.whenStable();
    return fixture;
  }

  function boton(el: HTMLElement, texto: string): HTMLButtonElement {
    const encontrado = [...el.querySelectorAll('button')].find((b) =>
      b.textContent?.includes(texto),
    );
    if (!encontrado) {
      throw new Error(`No hay botón "${texto}"`);
    }
    return encontrado;
  }

  function elegir(el: HTMLElement, indice: number): void {
    const radio = el.querySelectorAll<HTMLInputElement>('input[type=radio]')[indice];
    radio?.click();
  }

  it('si se recarga, pide el cuestionario y muestra la primera pregunta con progreso', async () => {
    const fixture = await crear();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Pregunta 1 de 3');
    expect(el.textContent).toContain('¿Qué es una fracción?');
    expect(el.querySelectorAll('input[type=radio]')).toHaveLength(4);
    expect(boton(el, 'Anterior').disabled).toBe(true);
    expect(boton(el, 'Siguiente').disabled).toBe(true);
  });

  it('navega con Anterior/Siguiente y envía las respuestas al final', async () => {
    const fixture = await crear();
    const el = fixture.nativeElement as HTMLElement;
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    elegir(el, 0);
    await fixture.whenStable();
    boton(el, 'Siguiente').click();
    await fixture.whenStable();
    expect(el.textContent).toContain('Pregunta 2 de 3');

    boton(el, 'Anterior').click();
    await fixture.whenStable();
    expect(el.querySelectorAll<HTMLInputElement>('input[type=radio]')[0]?.checked).toBe(true);

    boton(el, 'Siguiente').click();
    await fixture.whenStable();
    elegir(el, 1);
    await fixture.whenStable();
    boton(el, 'Siguiente').click();
    await fixture.whenStable();
    expect(el.textContent).toContain('Pregunta 3 de 3');
    expect(boton(el, 'Ver mi resultado').disabled).toBe(true);

    elegir(el, 1);
    await fixture.whenStable();
    boton(el, 'Ver mi resultado').click();
    const req = backend.expectOne(`${API}/diagnostico/s-1/respuestas`);
    expect(req.request.body).toEqual({
      respuestas: [
        { id_pregunta: 'p-1', respuesta: 'a' },
        { id_pregunta: 'p-2', respuesta: 'b' },
        { id_pregunta: 'p-3', respuesta: 'b' },
      ],
    });
    req.flush({
      id_sesion: 's-1',
      nivel_estimado: 'INTERMEDIO',
      puntaje: 66,
      aciertos: 2,
      total_preguntas: 3,
      resultados: [],
    });
    expect(navegar).toHaveBeenCalledWith(['/diagnostico', 's-1', 'resultado']);
    expect(TestBed.inject(FlujoDiagnosticoService).resultadoDe('s-1')?.aciertos).toBe(2);
  });

  it('SESION_YA_EVALUADA redirige al resultado', async () => {
    const fixture = await crear();
    const el = fixture.nativeElement as HTMLElement;
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    for (let i = 0; i < 3; i++) {
      elegir(el, 0);
      await fixture.whenStable();
      if (i < 2) {
        boton(el, 'Siguiente').click();
        await fixture.whenStable();
      }
    }
    boton(el, 'Ver mi resultado').click();
    backend
      .expectOne(`${API}/diagnostico/s-1/respuestas`)
      .flush(cuerpoError('SESION_YA_EVALUADA'), { status: 409, statusText: '' });
    expect(navegar).toHaveBeenCalledWith(['/diagnostico', 's-1', 'resultado']);
  });
});
