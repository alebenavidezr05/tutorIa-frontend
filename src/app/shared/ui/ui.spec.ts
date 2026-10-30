import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BloqueoPremiumComponent } from './bloqueo-premium/bloqueo-premium.component';
import { SelectorArchivoComponent } from './selector-archivo/selector-archivo.component';
import { TAMANO_MAXIMO_ARCHIVO } from '../validators/archivo.validator';

describe('SelectorArchivoComponent', () => {
  async function crear() {
    TestBed.configureTestingModule({ imports: [SelectorArchivoComponent] });
    const fixture = TestBed.createComponent(SelectorArchivoComponent);
    await fixture.whenStable();
    const elegidos: File[] = [];
    fixture.componentInstance.seleccionar.subscribe((f) => elegidos.push(f));
    return { fixture, elegidos };
  }

  function elegir(entrada: HTMLInputElement, archivo: File): void {
    Object.defineProperty(entrada, 'files', {
      value: { item: () => archivo, length: 1 },
      configurable: true,
    });
    entrada.dispatchEvent(new Event('change'));
  }

  it('emite el archivo si el tipo y el tamaño son válidos', async () => {
    const { fixture, elegidos } = await crear();
    const entrada = fixture.nativeElement.querySelector('input[type=file]') as HTMLInputElement;
    elegir(entrada, new File(['%PDF'], 'resumen.pdf', { type: 'application/pdf' }));
    await fixture.whenStable();
    expect(elegidos).toHaveLength(1);
    expect(fixture.nativeElement.querySelector('.mensaje-error')).toBeNull();
  });

  it('muestra error y no emite con un tipo no permitido', async () => {
    const { fixture, elegidos } = await crear();
    const entrada = fixture.nativeElement.querySelector('input[type=file]') as HTMLInputElement;
    elegir(entrada, new File(['MZ'], 'programa.exe', { type: 'application/x-msdownload' }));
    await fixture.whenStable();
    expect(elegidos).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('.mensaje-error')?.textContent).toContain('PDF');
  });

  it('muestra error con más de 5 MB', async () => {
    const { fixture, elegidos } = await crear();
    const grande = new File(['x'], 'foto.png', { type: 'image/png' });
    Object.defineProperty(grande, 'size', { value: TAMANO_MAXIMO_ARCHIVO + 1 });
    elegir(fixture.nativeElement.querySelector('input[type=file]'), grande);
    await fixture.whenStable();
    expect(elegidos).toHaveLength(0);
    expect(fixture.nativeElement.textContent).toContain('5 MB');
  });

  it('muestra el archivo elegido, su tamaño, el aviso de IA y permite quitarlo', async () => {
    const { fixture } = await crear();
    let quitado = false;
    fixture.componentInstance.quitar.subscribe(() => (quitado = true));
    fixture.componentRef.setInput(
      'archivo',
      new File(['hola'], 'notas.txt', { type: 'text/plain' }),
    );
    await fixture.whenStable();
    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('notas.txt');
    expect(texto).toContain('4 B');
    expect(texto).toContain('No incluyas datos personales de otras personas');
    (fixture.nativeElement.querySelector('.selector__quitar') as HTMLButtonElement).click();
    expect(quitado).toBe(true);
  });

  it('muestra el error del servidor y conserva el archivo', async () => {
    const { fixture } = await crear();
    fixture.componentRef.setInput('archivo', new File(['x'], 'a.png', { type: 'image/png' }));
    fixture.componentRef.setInput(
      'errorServidor',
      'El archivo contiene material que no está permitido.',
    );
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('a.png');
    expect(fixture.nativeElement.querySelector('[role=alert]')?.textContent).toContain(
      'no está permitido',
    );
  });
});

describe('BloqueoPremiumComponent', () => {
  it('explica con texto que es de Premium y enlaza a /planes', async () => {
    TestBed.configureTestingModule({
      imports: [BloqueoPremiumComponent],
      providers: [provideRouter([])],
    });
    const fixture = TestBed.createComponent(BloqueoPremiumComponent);
    fixture.componentRef.setInput('descripcion', 'El reporte de progreso es de Premium.');
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Esta función es de Premium');
    expect(el.textContent).toContain('El reporte de progreso es de Premium.');
    expect(el.querySelector('a')?.getAttribute('href')).toBe('/planes');
  });
});
