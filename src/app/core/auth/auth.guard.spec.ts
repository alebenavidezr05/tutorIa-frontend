import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { usuarioPrueba } from '../../../testing/datos-prueba';
import { proveedoresHttpPrueba } from '../../../testing/proveedores-prueba';
import { UsuarioPublico } from '../models';
import { autenticadoGuard, cuentaActivaGuard, invitadoGuard } from './auth.guard';
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
  });
});
