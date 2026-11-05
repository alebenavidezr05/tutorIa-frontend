import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { HistorialApiService } from '../../../core/api/historial-api.service';
import { SesionService } from '../../../core/auth/sesion.service';
import { HistorialPagina } from '../../../core/models';
import { BloqueoPremiumComponent } from '../../../shared/ui/bloqueo-premium/bloqueo-premium.component';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { EstadoVacioComponent } from '../../../shared/ui/estado-vacio/estado-vacio.component';
import { InsigniaNivelComponent } from '../../../shared/ui/insignia-nivel/insignia-nivel.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { conIndicador } from '../../../shared/utils/con-indicador';

const TAMANO_PAGINA = 10;

export const TEXTOS_HISTORIAL = {
  titulo: 'Historial',
  intro: 'Tus diagnósticos y planes de estudio. Abre uno para seguir donde lo dejaste.',
  vacioTitulo: 'Aún no tienes temas. ¿Empezamos con el primero?',
  vacioTexto: 'Elige un tema, responde el diagnóstico y armamos tu primer plan de estudio.',
  empezar: 'Elegir un tema',
  verPlan: 'Ver plan',
  sinNivel: 'Sin nivel',
  anterior: 'Página anterior',
  siguiente: 'Página siguiente',
  pagina: (actual: number, total: number) => `Página ${actual} de ${total}`,
  limitado: 'Mejora a Premium para ver todo tu historial',
  error: 'Algo no salió como esperaba. Intentémoslo de nuevo.',
  reintentar: 'Reintentar',
} as const;

@Component({
  selector: 'app-historial-page',
  imports: [
    DatePipe,
    RouterLink,
    BloqueoPremiumComponent,
    BotonComponent,
    EstadoVacioComponent,
    InsigniaNivelComponent,
    SpinnerComponent,
  ],
  templateUrl: './historial-page.component.html',
  styles: `
    .tarjeta-plan {
      display: flex;
      flex-direction: column;
      gap: var(--espacio-2);
      height: 100%;
      padding: var(--espacio-5);
      border: 1px solid var(--color-borde-suave);
      border-radius: var(--radio-xl);
      background: var(--color-superficie);
      box-shadow: var(--sombra-suave);
      color: var(--color-texto);
      text-decoration: none;
      transition:
        border-color var(--duracion-transicion),
        box-shadow var(--duracion-transicion);

      &:hover {
        border-color: var(--color-acento);
        box-shadow: var(--sombra-elevada);
      }
    }

    .tarjeta-plan__tema {
      margin: 0;
      font-family: var(--fuente-cuerpo);
      font-weight: 800;
      font-size: var(--texto-md);
    }

    .tarjeta-plan__fecha {
      margin: 0;
      color: var(--color-texto-suave);
      font-size: var(--texto-sm);
    }

    .tarjeta-plan__ver {
      margin-top: auto;
      font-weight: 700;
      text-decoration: underline;
    }

    .paginacion {
      justify-content: space-between;
      margin-block: var(--espacio-5);
    }

    app-bloqueo-premium {
      margin-top: var(--espacio-5);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistorialPageComponent implements OnInit {
  private readonly api = inject(HistorialApiService);
  private readonly sesion = inject(SesionService);

  protected readonly textos = TEXTOS_HISTORIAL;
  protected readonly pagina = signal(1);
  protected readonly datos = signal<HistorialPagina | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal(false);

  protected readonly totalPaginas = computed(() => {
    const datos = this.datos();
    return datos ? Math.max(1, Math.ceil(datos.total / datos.tamano)) : 1;
  });
  protected readonly textoPagina = computed(() =>
    this.textos.pagina(this.pagina(), this.totalPaginas()),
  );

  ngOnInit(): void {
    this.cargar();
  }

  protected irA(pagina: number): void {
    this.pagina.set(pagina);
    this.cargar();
  }

  protected cargar(): void {
    const usuario = this.sesion.usuario();
    if (!usuario) {
      return;
    }
    this.error.set(false);
    this.api
      .listar(usuario.id_usuario, this.pagina(), TAMANO_PAGINA)
      .pipe(conIndicador(this.cargando))
      .subscribe({
        next: (datos) => this.datos.set(datos),
        error: () => this.error.set(true),
      });
  }
}
