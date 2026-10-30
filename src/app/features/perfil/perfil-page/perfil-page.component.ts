import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { PerfilApiService } from '../../../core/api/perfil-api.service';
import { SuscripcionApiService } from '../../../core/api/suscripcion-api.service';
import { CapacidadesService } from '../../../core/auth/capacidades.service';
import { SesionService } from '../../../core/auth/sesion.service';
import { LimitesPublicos, TipoNivel, UsuarioPublico, comoApiError } from '../../../core/models';
import { NotificacionService } from '../../../core/notificaciones/notificacion.service';
import { AvisoErrorComponent } from '../../../shared/ui/aviso-error/aviso-error.component';
import { BloqueoPremiumComponent } from '../../../shared/ui/bloqueo-premium/bloqueo-premium.component';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { CampoFormularioComponent } from '../../../shared/ui/campo-formulario/campo-formulario.component';
import { ControlCampoDirective } from '../../../shared/ui/campo-formulario/control-campo.directive';
import { DialogoConfirmacionComponent } from '../../../shared/ui/dialogo-confirmacion/dialogo-confirmacion.component';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { TarjetaComponent } from '../../../shared/ui/tarjeta/tarjeta.component';
import { aplicarErroresServidor } from '../../../shared/utils/aplicar-errores-servidor';
import { AvisoPagina, avisoDeError } from '../../../shared/utils/aviso-error';
import { conIndicador } from '../../../shared/utils/con-indicador';
import { descargarBlob, nombreConFecha } from '../../../shared/utils/descargar-archivo';
import { enfocarPrimerError } from '../../../shared/utils/enfocar-error';
import {
  NIVELES_POR_TIPO,
  nivelEducativoValidator,
  nombreValidator,
  normalizarTexto,
} from '../../../shared/validators';
import { NOMBRE_LIMITE, NOMBRE_PLAN, TEXTOS_PERFIL } from '../perfil.textos';

@Component({
  selector: 'app-perfil-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AvisoErrorComponent,
    BloqueoPremiumComponent,
    BotonComponent,
    CampoFormularioComponent,
    ControlCampoDirective,
    DialogoConfirmacionComponent,
    IconoComponent,
    TarjetaComponent,
  ],
  templateUrl: './perfil-page.component.html',
  styleUrl: './perfil-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerfilPageComponent implements OnInit {
  private readonly perfilApi = inject(PerfilApiService);
  private readonly suscripcionApi = inject(SuscripcionApiService);
  private readonly sesion = inject(SesionService);
  private readonly notificaciones = inject(NotificacionService);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly capacidades = inject(CapacidadesService);

  protected readonly textos = TEXTOS_PERFIL;
  protected readonly usuario = this.sesion.usuario;
  protected readonly guardando = signal(false);
  protected readonly descargando = signal(false);
  protected readonly desactivando = signal(false);
  protected readonly cerrando = signal(false);
  protected readonly dialogoDesactivar = signal(false);
  protected readonly avisoReporte = signal<AvisoPagina | null>(null);
  protected readonly tieneReporte = this.capacidades.tiene('REPORTE_PROGRESO');

  protected readonly form = inject(NonNullableFormBuilder).group({
    nombre: ['', [Validators.required, nombreValidator()]],
    tipoNivel: ['' as TipoNivel | '', [Validators.required]],
    nivelEducativo: ['', [Validators.required, nivelEducativoValidator('tipoNivel')]],
  });
  private readonly tipo = toSignal(this.form.controls.tipoNivel.valueChanges.pipe(map((t) => t)), {
    initialValue: this.form.controls.tipoNivel.value,
  });
  protected readonly opcionesNivel = computed(() => {
    const tipo = this.tipo();
    return tipo ? NIVELES_POR_TIPO[tipo] : [];
  });
  protected readonly nombrePlan = computed(() => {
    const plan = this.capacidades.suscripcion()?.plan;
    return plan ? NOMBRE_PLAN[plan] : '';
  });
  protected readonly cupos = computed(() => {
    const limites = this.capacidades.limites();
    return limites
      ? (Object.keys(NOMBRE_LIMITE) as (keyof LimitesPublicos)[]).map((clave) => ({
          clave,
          nombre: NOMBRE_LIMITE[clave],
          valor: limites[clave],
        }))
      : [];
  });

  ngOnInit(): void {
    const usuario = this.sesion.usuario();
    if (usuario) {
      this.rellenar(usuario);
      this.perfilApi.obtener(usuario.id_usuario).subscribe({
        next: (u) => this.rellenar(u),
        error: () => undefined,
      });
    }
    this.form.controls.tipoNivel.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.form.controls.nivelEducativo.setValue(''));
    this.capacidades.refrescar();
  }

  protected guardar(): void {
    const usuario = this.sesion.usuario();
    if (this.form.invalid || !usuario) {
      this.form.markAllAsTouched();
      enfocarPrimerError(this.host.nativeElement);
      return;
    }
    const v = this.form.getRawValue();
    this.perfilApi
      .actualizar(usuario.id_usuario, {
        nombre: normalizarTexto(v.nombre),
        tipo_nivel: v.tipoNivel as TipoNivel,
        nivel_educativo: v.nivelEducativo,
      })
      .pipe(conIndicador(this.guardando))
      .subscribe({
        next: (actualizado) => {
          this.sesion.establecer(actualizado);
          this.form.markAsPristine();
          this.notificaciones.exito(this.textos.guardado);
        },
        error: (e: unknown) => {
          aplicarErroresServidor(this.form, comoApiError(e));
          enfocarPrimerError(this.host.nativeElement);
        },
      });
  }

  protected descargarReporte(): void {
    this.avisoReporte.set(null);
    this.suscripcionApi
      .descargarReporte()
      .pipe(conIndicador(this.descargando))
      .subscribe({
        next: (blob) => {
          descargarBlob(blob, nombreConFecha('reporte-progreso-tutoria', 'csv'));
          this.notificaciones.exito(this.textos.reporteDescargado);
        },
        error: (e: unknown) => this.avisoReporte.set(avisoDeError(comoApiError(e))),
      });
  }

  protected cerrarSesion(): void {
    this.cerrando.set(true);
    this.sesion.cerrar().subscribe({
      complete: () => void this.router.navigateByUrl('/login'),
      error: () => void this.router.navigateByUrl('/login'),
    });
  }

  protected desactivar(): void {
    const usuario = this.sesion.usuario();
    if (!usuario) {
      return;
    }
    this.perfilApi
      .desactivar(usuario.id_usuario)
      .pipe(conIndicador(this.desactivando))
      .subscribe({
        next: () => {
          this.dialogoDesactivar.set(false);
          this.sesion.limpiar();
          this.notificaciones.info(this.textos.desactivada);
          void this.router.navigateByUrl('/login');
        },
        error: () => this.dialogoDesactivar.set(false),
      });
  }

  private rellenar(usuario: UsuarioPublico): void {
    this.form.setValue(
      { nombre: usuario.nombre, tipoNivel: usuario.tipo_nivel, nivelEducativo: '' },
      { emitEvent: true },
    );
    this.form.controls.nivelEducativo.setValue(usuario.nivel_educativo);
    this.form.markAsPristine();
  }
}
