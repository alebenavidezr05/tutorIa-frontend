import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { PrivacidadApiService } from '../../../core/api/privacidad-api.service';
import { PoliticaPublica } from '../../../core/models';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { TarjetaComponent } from '../../../shared/ui/tarjeta/tarjeta.component';
import { TextoLegalComponent } from '../../../shared/ui/texto-legal/texto-legal.component';
import { conIndicador } from '../../../shared/utils/con-indicador';
import { NOMBRE_FINALIDAD } from '../../privacidad/textos-finalidades';
import { TEXTOS_POLITICA } from '../legal.textos';

/** Pública. El texto y la versión vienen de GET /politica-tratamiento. */
@Component({
  selector: 'app-politica-page',
  imports: [
    BotonComponent,
    IconoComponent,
    SpinnerComponent,
    TarjetaComponent,
    TextoLegalComponent,
  ],
  templateUrl: './politica-page.component.html',
  styles: `
    .datos {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--espacio-1) var(--espacio-4);
      margin: 0;
    }

    dt {
      font-weight: 700;
    }

    dd {
      margin: 0 0 var(--espacio-2);
      overflow-wrap: anywhere;
    }

    .finalidad {
      margin-bottom: var(--espacio-3);
    }

    .finalidad__marca {
      font-weight: 800;
    }

    app-tarjeta {
      margin-bottom: var(--espacio-5);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoliticaPageComponent implements OnInit {
  private readonly api = inject(PrivacidadApiService);

  protected readonly textos = TEXTOS_POLITICA;
  protected readonly nombres = NOMBRE_FINALIDAD;
  protected readonly politica = signal<PoliticaPublica | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.error.set(false);
    this.api
      .politica()
      .pipe(conIndicador(this.cargando))
      .subscribe({
        next: (politica) => this.politica.set(politica),
        error: () => this.error.set(true),
      });
  }
}
