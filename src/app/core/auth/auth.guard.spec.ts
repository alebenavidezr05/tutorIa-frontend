import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { usuarioPrueba } from '../../../testing/datos-prueba';
import { proveedoresHttpPrueba } from '../../../testing/proveedores-prueba';
import { UsuarioPublico } from '../models';
import {
  RUTA_PENDIENTE,
  RUTA_VERIFICAR,
  autenticadoGuard,
  cuentaActivaGuard,
  enPasoGuard,
  invitadoGuard,
  siguientePaso,
} from './auth.guard';
import { SesionService } from './sesion.service';

describe('guards', () => {
  let sesion: SesionService;
  const ruta = {} as ActivatedRouteSnapshot;
  const estado = { url: '/plan/1' } as RouterStateSnapshot;

  function con(usuario: UsuarioPublico | null): void {
    vi.spyOn(sesion, 'asegurarRestaurada').mockResolvedValue(usuario);
  }

  async function ejecutar(guard: typeof autenticadoGuard): Promise<unknown> {
    return TestBed.runInInjectionContext(() => guard(ruta, estado));
  }

  function url(resultado: unknown): string {
    return TestBed.inject(Router).serializeUrl(resultado as UrlTree);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: proveedoresHttpPrueba() });
    sesion = TestBed.inject(SesionService);
  });

  describe('autenticadoGuard', () => {
    it('deja pasar con sesión', async () => {
      con(usuarioPrueba());
      expect(await ejecutar(autenticadoGuard)).toBe(true);
    });

    it('sin sesión lleva a /login recordando la ruta', async () => {
      con(null);
      expect(url(await ejecutar(autenticadoGuard))).toBe('/login?volver=%2Fplan%2F1');
    });
  });

  describe('invitadoGuard', () => {
    it('deja pasar sin sesión', async () => {
      con(null);
      expect(await ejecutar(invitadoGuard)).toBe(true);
    });

    it('con sesión activa redirige a /tema', async () => {
      con(usuarioPrueba());
      expect(url(await ejecutar(invitadoGuard))).toBe('/tema');
    });

    it('con el correo sin confirmar redirige a /verifica-tu-correo', async () => {
      con(usuarioPrueba({ correo_verificado: false }));
      expect(url(await ejecutar(invitadoGuard))).toBe('/verifica-tu-correo');
    });

    it('con cuenta pendiente redirige a /pendiente-autorizacion', async () => {
      con(usuarioPrueba({ estado_cuenta: 'PENDIENTE_AUTORIZACION' }));
      expect(url(await ejecutar(invitadoGuard))).toBe('/pendiente-autorizacion');
    });
  });

  describe('cuentaActivaGuard', () => {
    it('deja pasar si la cuenta está ACTIVA', async () => {
      con(usuarioPrueba());
      expect(await ejecutar(cuentaActivaGuard)).toBe(true);
    });

    it('si está pendiente de autorización lleva a /pendiente-autorizacion', async () => {
      con(usuarioPrueba({ estado_cuenta: 'PENDIENTE_AUTORIZACION' }));
      expect(url(await ejecutar(cuentaActivaGuard))).toBe('/pendiente-autorizacion');
    });

    it('correo sin confirmar lleva a /verifica-tu-correo, antes que la autorización', async () => {
      con(usuarioPrueba({ correo_verificado: false }));
      expect(url(await ejecutar(cuentaActivaGuard))).toBe('/verifica-tu-correo');
      con(
        usuarioPrueba({
          correo_verificado: false,
          es_menor: true,
          estado_cuenta: 'PENDIENTE_AUTORIZACION',
        }),
      );
      expect(url(await ejecutar(cuentaActivaGuard))).toBe('/verifica-tu-correo');
    });

    it('con el correo confirmado sigue su flujo (autorización o app)', async () => {
      con(usuarioPrueba({ es_menor: true, estado_cuenta: 'PENDIENTE_AUTORIZACION' }));
      expect(url(await ejecutar(cuentaActivaGuard))).toBe('/pendiente-autorizacion');
      con(usuarioPrueba({ es_menor: true }));
      expect(await ejecutar(cuentaActivaGuard)).toBe(true);
    });
  });

  describe('siguientePaso', () => {
    it('correo → autorización → destino', () => {
      expect(siguientePaso(usuarioPrueba({ correo_verificado: false }))).toBe(RUTA_VERIFICAR);
      expect(siguientePaso(usuarioPrueba({ estado_cuenta: 'PENDIENTE_AUTORIZACION' }))).toBe(
        RUTA_PENDIENTE,
      );
      expect(siguientePaso(usuarioPrueba())).toBe('/tema');
    });
  });

  describe('enPasoGuard (pantallas de espera)', () => {
    it('una cuenta completa que abre las pantallas de espera va al destino', async () => {
      con(usuarioPrueba());
      expect(url(await ejecutar(enPasoGuard(RUTA_VERIFICAR)))).toBe('/tema');
      expect(url(await ejecutar(enPasoGuard(RUTA_PENDIENTE)))).toBe('/tema');
    });

    it('correo confirmado en /verifica-tu-correo va a su paso; sin confirmar se queda', async () => {
      con(usuarioPrueba({ es_menor: true, estado_cuenta: 'PENDIENTE_AUTORIZACION' }));
      expect(url(await ejecutar(enPasoGuard(RUTA_VERIFICAR)))).toBe('/pendiente-autorizacion');
      expect(await ejecutar(enPasoGuard(RUTA_PENDIENTE))).toBe(true);
      con(usuarioPrueba({ correo_verificado: false }));
      expect(await ejecutar(enPasoGuard(RUTA_VERIFICAR))).toBe(true);
      expect(url(await ejecutar(enPasoGuard(RUTA_PENDIENTE)))).toBe('/verifica-tu-correo');
    });
  });
});
