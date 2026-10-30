import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { suscripcionPrueba } from '../../../testing/datos-prueba';
import { API, proveedoresHttpPrueba } from '../../../testing/proveedores-prueba';
import { CapacidadesService } from './capacidades.service';

describe('CapacidadesService', () => {
  let servicio: CapacidadesService;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: proveedoresHttpPrueba() });
    servicio = TestBed.inject(CapacidadesService);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('refleja las capacidades y límites que envía el backend', () => {
    const reporte = servicio.tiene('REPORTE_PROGRESO');
    expect(reporte()).toBe(false);
    expect(servicio.cargada()).toBe(false);

    servicio.refrescar();
    backend
      .expectOne(`${API}/suscripcion`)
      .flush(
        suscripcionPrueba({
          plan: 'PREMIUM',
          capacidades: ['REPORTE_PROGRESO', 'HISTORIAL_COMPLETO'],
        }),
      );

    expect(reporte()).toBe(true);
    expect(servicio.tiene('TEMAS_SIMULTANEOS')()).toBe(false);
    expect(servicio.esPremium()).toBe(true);
    expect(servicio.limites()?.archivos_restantes_hoy).toBe(3);
  });

  it('limpiar() olvida la suscripción', () => {
    servicio.refrescar();
    backend.expectOne(`${API}/suscripcion`).flush(suscripcionPrueba());
    servicio.limpiar();
    expect(servicio.suscripcion()).toBeNull();
  });
});
