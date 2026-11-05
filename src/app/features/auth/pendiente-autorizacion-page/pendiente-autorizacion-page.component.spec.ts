import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { cuerpoError, usuarioPrueba } from '../../../../testing/datos-prueba';
import { API, proveedoresHttpPrueba } from '../../../../testing/proveedores-prueba';
import { SesionService } from '../../../core/auth/sesion.service';
import { MiAutorizacion } from '../../../core/models';
import { NotificacionService } from '../../../core/notificaciones/notificacion.service';
import {
  PendienteAutorizacionPageComponent,
  formatearCuenta,
} from './pendiente-autorizacion-page.component';

const MENOR = usuarioPrueba({ es_menor: true, estado_cuenta: 'PENDIENTE_AUTORIZACION' });

describe('PendienteAutorizacionPageComponent', () => {
  let fixture: ComponentFixture<PendienteAutorizacionPageComponent>;
  let backend: HttpTestingController;
  let el: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    TestBed.configureTestingModule({
      imports: [PendienteAutorizacionPageComponent],
      providers: proveedoresHttpPrueba(),
    });
    backend = TestBed.inject(HttpTestingController);
    TestBed.inject(SesionService).establecer(MENOR);
  });

  afterEach(() => {
    vi.useRealTimers();
    backend.verify();
  });

  function mia(cambios: Partial<MiAutorizacion> = {}): MiAutorizacion {
    return {
      estado: 'PENDIENTE',
      correo_acudiente_enmascarado: 'j***@gmail.com',
      puede_reenviar_en_segundos: 0,
      ...cambios,
    };
  }

  async function abrir(datos: MiAutorizacion): Promise<void> {
    fixture = TestBed.createComponent(PendienteAutorizacionPageComponent);
    fixture.detectChanges();
    backend.expectOne(`${API}/autorizaciones/mia`).flush(datos);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  }

  function boton(texto: string): HTMLButtonElement | undefined {
    return [...el.querySelectorAll<HTMLButtonElement>('button')].find((b) =>
      b.textContent?.trim().startsWith(texto),
    );
  }

  async function avanzar(segundos: number): Promise<void> {
    vi.advanceTimersByTime(segundos * 1000);
    await fixture.whenStable();
  }

  it('PENDIENTE: muestra el correo enmascarado y no ofrece el enlace para el adulto', async () => {
    await abrir(mia());
    expect(el.textContent).toContain('Se envió un correo a j***@gmail.com');
    expect(boton('Ya lo autorizó, revisar')).toBeDefined();
    expect(boton('Reenviar correo')).toBeDefined();
    expect(boton('Usar otro correo')).toBeDefined();
    expect(el.textContent).not.toContain('/autorizacion');
  });

  it('el reenvío espera la cuenta regresiva de puede_reenviar_en_segundos', async () => {
    await abrir(mia({ puede_reenviar_en_segundos: 105 }));
    expect(el.textContent).toContain('Podrás reenviar en 1:45');
    expect(boton('Reenviar correo')?.disabled).toBe(true);
    await avanzar(45);
    expect(el.textContent).toContain('Podrás reenviar en 1:00');
    await avanzar(60);
    expect(el.textContent).not.toContain('Podrás reenviar');
    expect(boton('Reenviar correo')?.disabled).toBe(false);
  });

  it('reenviar al mismo correo confirma y vuelve a consultar el estado', async () => {
    const exito = vi.spyOn(TestBed.inject(NotificacionService), 'exito');
    await abrir(mia());
    boton('Reenviar correo')?.click();
    const req = backend.expectOne(`${API}/autorizaciones/reenviar`);
    expect(req.request.body).toEqual({});
    req.flush(null, { status: 202, statusText: 'Accepted' });
    backend.expectOne(`${API}/autorizaciones/mia`).flush(mia({ puede_reenviar_en_segundos: 120 }));
    await fixture.whenStable();
    expect(exito).toHaveBeenCalledWith('Listo, el correo se envió de nuevo.');
    expect(el.textContent).toContain('Podrás reenviar en 2:00');
  });

  it('un 429 usa Retry-After para la cuenta regresiva', async () => {
    await abrir(mia());
    boton('Reenviar correo')?.click();
    backend
      .expectOne(`${API}/autorizaciones/reenviar`)
      .flush(cuerpoError('DEMASIADAS_SOLICITUDES'), {
        status: 429,
        statusText: '',
        headers: { 'Retry-After': '30' },
      });
    await fixture.whenStable();
    expect(el.textContent).toContain('Ya se enviaron varios correos');
    expect(el.textContent).toContain('Podrás reenviar en 0:30');
    expect(boton('Reenviar correo')?.disabled).toBe(true);
  });

  it('usar otro correo valida que sea distinto al propio y lo envía', async () => {
    await abrir(mia());
    boton('Usar otro correo')?.click();
    await fixture.whenStable();
    const campo = el.querySelector<HTMLInputElement>('#pendiente-correo') as HTMLInputElement;
    campo.value = MENOR.correo;
    campo.dispatchEvent(new Event('input'));
    boton('Enviar a este correo')?.click();
    await fixture.whenStable();
    backend.expectNone(`${API}/autorizaciones/reenviar`);
    expect(el.textContent).toContain('debe ser distinto al tuyo');

    campo.value = 'Papa@Correo.com';
    campo.dispatchEvent(new Event('input'));
    boton('Enviar a este correo')?.click();
    const req = backend.expectOne(`${API}/autorizaciones/reenviar`);
    expect(req.request.body).toEqual({ correo_acudiente: 'papa@correo.com' });
    req.flush(null, { status: 202, statusText: 'Accepted' });
    backend
      .expectOne(`${API}/autorizaciones/mia`)
      .flush(mia({ correo_acudiente_enmascarado: 'p***@correo.com' }));
    await fixture.whenStable();
    expect(el.textContent).toContain('p***@correo.com');
  });

  it('CORREO_ACUDIENTE_INVALIDO se muestra junto al campo nuevo', async () => {
    await abrir(mia());
    boton('Usar otro correo')?.click();
    await fixture.whenStable();
    const campo = el.querySelector<HTMLInputElement>('#pendiente-correo') as HTMLInputElement;
    campo.value = 'papa@correo.com';
    campo.dispatchEvent(new Event('input'));
    boton('Enviar a este correo')?.click();
    backend
      .expectOne(`${API}/autorizaciones/reenviar`)
      .flush(cuerpoError('CORREO_ACUDIENTE_INVALIDO', 'Ese correo no es válido.'), {
        status: 422,
        statusText: '',
      });
    await fixture.whenStable();
    expect(el.querySelector('#pendiente-correo-error')?.textContent).toContain(
      'Ese correo no es válido.',
    );
  });

  it('RECHAZADA: mensaje amable y opción de otro correo, sin reenviar al mismo', async () => {
    await abrir(mia({ estado: 'RECHAZADA' }));
    expect(el.textContent).toContain('no autorizó la cuenta por ahora');
    expect(boton('Reenviar correo')).toBeUndefined();
    expect(boton('Usar otro correo')).toBeDefined();
  });

  it.each([
    ['EXPIRADA', 'ya venció'],
    ['REVOCADA', 'retiró la autorización'],
  ] as const)('%s: mensaje claro, reenviar u otro correo', async (estado, texto) => {
    await abrir(mia({ estado }));
    expect(el.textContent).toContain(texto);
    expect(boton('Reenviar correo')).toBeDefined();
    expect(boton('Usar otro correo')).toBeDefined();
  });

  it('AUTORIZADA: restaura la sesión y entra a la app', async () => {
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    await abrir(mia({ estado: 'AUTORIZADA' }));
    backend.expectOne(`${API}/auth/me`).flush(usuarioPrueba());
    await fixture.whenStable();
    expect(navegar).toHaveBeenCalledWith('/tema');
  });

  it('«Ya lo autorizó, revisar» con la cuenta activa navega de inmediato al destino', async () => {
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    await abrir(mia());
    boton('Ya lo autorizó, revisar')?.click();
    backend.expectOne(`${API}/auth/me`).flush(usuarioPrueba({ es_menor: true }));
    await fixture.whenStable();
    expect(navegar).toHaveBeenCalledExactlyOnceWith('/tema');
    expect(el.textContent).not.toContain('Aún no hay respuesta');
  });

  it('«Ya lo autorizó, revisar» sin respuesta se queda y muestra el aviso (solo entonces)', async () => {
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    await abrir(mia());
    const aviso = 'Aún no hay respuesta de tu adulto responsable. Te avisamos aquí apenas la dé.';
    expect(el.textContent).not.toContain(aviso);
    boton('Ya lo autorizó, revisar')?.click();
    backend.expectOne(`${API}/auth/me`).flush(MENOR);
    await fixture.whenStable();
    expect(navegar).not.toHaveBeenCalled();
    expect(el.textContent).toContain(aviso);
    expect(TestBed.inject(NotificacionService).cola()).toHaveLength(0);
  });

  it('formatearCuenta muestra minutos y segundos', () => {
    expect(formatearCuenta(105)).toBe('1:45');
    expect(formatearCuenta(5)).toBe('0:05');
    expect(formatearCuenta(0)).toBe('0:00');
  });
});
