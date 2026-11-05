import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PlanApiService } from '../../../core/api/plan-api.service';
import { comoApiError } from '../../../core/models';
import { AvisoErrorComponent } from '../../../shared/ui/aviso-error/aviso-error.component';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { EstadoVacioComponent } from '../../../shared/ui/estado-vacio/estado-vacio.component';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { InsigniaNivelComponent } from '../../../shared/ui/insignia-nivel/insignia-nivel.component';
import { ListaReferenciasComponent } from '../../../shared/ui/lista-referencias/lista-referencias.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { TarjetaComponent } from '../../../shared/ui/tarjeta/tarjeta.component';
import { VexComponent } from '../../../shared/ui/vex/vex.component';
import { AvisoPagina, avisoDeError } from '../../../shared/utils/aviso-error';
import { conIndicador } from '../../../shared/utils/con-indicador';
import { construirRevision } from '../construir-revision';
import { TEXTOS_RESULTADO } from '../diagnostico.textos';
import { FlujoDiagnosticoService } from '../flujo-diagnostico.service';

@Component({
  selector: 'app-resultado-page',
  imports: [
    RouterLink,
    AvisoErrorComponent,
    BotonComponent,
    EstadoVacioComponent,
    IconoComponent,
    InsigniaNivelComponent,
    ListaReferenciasComponent,
    SpinnerComponent,
    TarjetaComponent,
    VexComponent,
  ],
  templateUrl: './resultado-page.component.html',
  styleUrl: './resultado-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultadoPageComponent {
  readonly idSesion = input.required<string>();

  private readonly planApi = inject(PlanApiService);
  private readonly flujo = inject(FlujoDiagnosticoService);
  private readonly router = inject(Router);

  protected readonly textos = TEXTOS_RESULTADO;
  protected readonly generando = signal(false);
  protected readonly aviso = signal<AvisoPagina | null>(null);

  protected readonly resultado = computed(() => this.flujo.resultadoDe(this.idSesion()));
  protected readonly revision = computed(() => {
    const resultado = this.resultado();
    return resultado ? construirRevision(this.flujo.cuestionario(), resultado) : [];
  });
  protected readonly textoAciertos = computed(() => {
    const r = this.resultado();
    return r ? this.textos.aciertos(r.aciertos, r.total_preguntas) : '';
  });

  protected generarPlan(): void {
    this.aviso.set(null);
    this.planApi
      .generar(this.idSesion())
      .pipe(conIndicador(this.generando))
      .subscribe({
        next: (plan) => void this.router.navigate(['/plan', plan.id_plan]),
        error: (e: unknown) => this.aviso.set(avisoDeError(comoApiError(e))),
      });
  }
}
