import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { PrivacidadApiService } from '../../../core/api/privacidad-api.service';
import { CumplimientoPublico } from '../../../core/models';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { TarjetaComponent } from '../../../shared/ui/tarjeta/tarjeta.component';
import { conIndicador } from '../../../shared/utils/con-indicador';
import { NOMBRE_RETENCION, TEXTOS_CUMPLIMIENTO } from '../legal.textos';

@Component({
  selector: 'app-cumplimiento-page',
  imports: [RouterLink, BotonComponent, IconoComponent, SpinnerComponent, TarjetaComponent],
  templateUrl: './cumplimiento-page.component.html',
  styles: `
    section {
      margin-bottom: var(--espacio-6);
    }

    .proveedor h3 {
      font-size: var(--texto-md);
    }

    dt {
      font-weight: 700;
    }

    dd {
      margin: 0 0 var(--espacio-2);
    }

    .retencion {
      padding-left: var(--espacio-5);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CumplimientoPageComponent implements OnInit {
  private readonly api = inject(PrivacidadApiService);

  protected readonly textos = TEXTOS_CUMPLIMIENTO;
  protected readonly datos = signal<CumplimientoPublico | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal(false);

  protected readonly retencion = computed(() =>
    Object.entries(this.datos()?.retencion_dias ?? {}).map(([clave, dias]) => ({
      clave,
      nombre: NOMBRE_RETENCION[clave] ?? clave.replace(/_/g, ' '),
      dias: this.textos.dias(dias),
    })),
  );
  protected readonly textoEdad = computed(() => {
    const datos = this.datos();
    return datos ? this.textos.edadTexto(datos.edad_minima) : '';
  });

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.error.set(false);
    this.api
      .cumplimiento()
      .pipe(conIndicador(this.cargando))
      .subscribe({
        next: (datos) => this.datos.set(datos),
        error: () => this.error.set(true),
      });
  }
}
