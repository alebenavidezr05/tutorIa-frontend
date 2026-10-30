import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { visualPrueba } from '../../../../testing/datos-prueba';
import { API, proveedoresHttpPrueba } from '../../../../testing/proveedores-prueba';
import { VisualPublico } from '../../../core/models';
import { ImagenTutorComponent } from './imagen-tutor.component';
import {
  INTENTOS_RAPIDOS,
  TIEMPO_MAXIMO_MS,
  calcularEsperasSondeo,
  sondearVisual,
} from './sondeo-visual';
import { VisualTutorComponent } from './visual-tutor.component';

describe('sondeo del visual', () => {
  it('cada 2 s hasta 8 intentos y luego cada 5 s hasta 60 s', () => {
    const esperas = calcularEsperasSondeo();
    expect(esperas.slice(0, INTENTOS_RAPIDOS).every((ms) => ms === 2000)).toBe(true);
    expect(esperas.slice(INTENTOS_RAPIDOS).every((ms) => ms === 5000)).toBe(true);
    expect(esperas.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(TIEMPO_MAXIMO_MS);
  });

  it('se detiene al llegar a LISTO (incluido)', () => {
    vi.useFakeTimers();
    const estados: VisualPublico['estado'][] = ['PROCESANDO', 'LISTO', 'PROCESANDO'];
    const consultar = vi.fn(() => of(visualPrueba({ estado: estados.shift() ?? 'LISTO' })));
    const recibidos: string[] = [];
    sondearVisual(consultar, 'm-1').subscribe((v) => recibidos.push(v.estado));
    vi.advanceTimersByTime(10_000);
    expect(recibidos).toEqual(['PROCESANDO', 'LISTO']);
    expect(consultar).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});

describe('VisualTutorComponent', () => {
  let backend: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [VisualTutorComponent],
      providers: proveedoresHttpPrueba(),
    });
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function crear(visual: VisualPublico | null) {
    const fixture = TestBed.createComponent(VisualTutorComponent);
    fixture.componentRef.setInput('idMensaje', 'm-1');
    fixture.componentRef.setInput('visual', visual);
    fixture.detectChanges();
    return fixture;
  }

  it('muestra "Preparando una imagen…" y consulta hasta LISTO', async () => {
    const fixture = crear(visualPrueba({ estado: 'PENDIENTE', imagen: null }));
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[aria-busy=true]')?.textContent).toContain('Preparando una imagen');

    await vi.advanceTimersByTimeAsync(2000);
    backend
      .expectOne(`${API}/mensajes/m-1/visual`)
      .flush(visualPrueba({ estado: 'PROCESANDO', imagen: null }));
    await vi.advanceTimersByTimeAsync(2000);
    backend.expectOne(`${API}/mensajes/m-1/visual`).flush(visualPrueba());
    fixture.detectChanges();

    expect(el.querySelector('[aria-busy=true]')).toBeNull();
    expect(el.querySelector('img')?.getAttribute('alt')).toBe('Pizza dividida en cuatro partes');
    await vi.advanceTimersByTimeAsync(10_000);
    backend.expectNone(`${API}/mensajes/m-1/visual`);
  });

  it('FALLIDO se oculta sin mostrar error', async () => {
    const fixture = crear(visualPrueba({ estado: 'PENDIENTE', imagen: null }));
    await vi.advanceTimersByTimeAsync(2000);
    backend
      .expectOne(`${API}/mensajes/m-1/visual`)
      .flush(visualPrueba({ estado: 'FALLIDO', imagen: null }));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.trim()).toBe('');
  });

  it('una ilustración IA lleva la etiqueta visible y el aviso del backend', () => {
    const fixture = crear(
      visualPrueba({
        tipo: 'IA',
        generado_por_ia: true,
        aviso_ia: 'Imagen creada por IA: puede contener errores.',
      }),
    );
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Ilustración generada por IA');
    expect(texto).toContain('Imagen creada por IA: puede contener errores.');
  });

  it('deja de consultar al destruirse', async () => {
    const fixture = crear(visualPrueba({ estado: 'PENDIENTE', imagen: null }));
    fixture.destroy();
    await vi.advanceTimersByTimeAsync(TIEMPO_MAXIMO_MS);
    backend.expectNone(`${API}/mensajes/m-1/visual`);
  });

  it('pinta un diagrama con su alternativa textual', () => {
    const fixture = crear(
      visualPrueba({
        tipo: 'DIAGRAMA',
        imagen: null,
        diagrama: {
          tipo_diagrama: 'flujo',
          titulo: 'Ciclo del agua',
          nodos: [
            { id: 'a', texto: 'Evaporación' },
            { id: 'b', texto: 'Condensación' },
          ],
          aristas: [{ desde: 'a', hasta: 'b', etiqueta: 'sube' }],
        },
      }),
    );
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('svg[role=img] title')?.textContent).toBe('Ciclo del agua');
    expect(el.querySelector('details li')?.textContent).toBe('Evaporación → Condensación: sube');
  });
});

describe('ImagenTutorComponent', () => {
  it('si la imagen no carga, quedan el pie y la atribución', async () => {
    TestBed.configureTestingModule({ imports: [ImagenTutorComponent] });
    const fixture = TestBed.createComponent(ImagenTutorComponent);
    const imagen = visualPrueba().imagen;
    fixture.componentRef.setInput('imagen', imagen);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const img = el.querySelector('img');
    expect(img?.getAttribute('loading')).toBe('lazy');
    expect(img?.getAttribute('src')).toBe('/api/v1/visuales/v-1/imagen');

    img?.dispatchEvent(new Event('error'));
    await fixture.whenStable();

    expect(el.querySelector('img')).toBeNull();
    const texto = el.textContent ?? '';
    expect(texto).toContain('Una pizza dividida en cuartos');
    expect(texto).toContain('Ana Pérez');
    expect(texto).toContain('CC BY-SA 4.0');
    expect(texto).toContain('Wikimedia Commons');
    expect(
      el.querySelector('a[href="https://commons.wikimedia.org/wiki/File:Pizza.jpg"]'),
    ).not.toBeNull();
  });

  it('nunca usa una URL de terceros como src', async () => {
    TestBed.configureTestingModule({ imports: [ImagenTutorComponent] });
    const fixture = TestBed.createComponent(ImagenTutorComponent);
    const base = visualPrueba().imagen;
    fixture.componentRef.setInput(
      'imagen',
      base ? { ...base, url: 'https://upload.wikimedia.org/x.jpg' } : null,
    );
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('img')).toBeNull();
  });
});

describe('sondearVisual con errores', () => {
  it('propaga el error para que el componente oculte el visual', () => {
    vi.useFakeTimers();
    const fuente = new Subject<VisualPublico>();
    let fallo = false;
    sondearVisual(() => fuente, 'm-1').subscribe({ error: () => (fallo = true) });
    vi.advanceTimersByTime(2000);
    fuente.error(new Error('x'));
    expect(fallo).toBe(true);
    vi.useRealTimers();
  });
});
