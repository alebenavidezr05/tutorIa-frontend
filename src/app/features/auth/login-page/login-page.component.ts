import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthApiService } from '../../../core/api/auth-api.service';
import { destinoPostRegistro, siguientePaso } from '../../../core/auth/auth.guard';
import { SesionService } from '../../../core/auth/sesion.service';
import { UsuarioPublico, comoApiError, tieneCodigo } from '../../../core/models';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { CampoFormularioComponent } from '../../../shared/ui/campo-formulario/campo-formulario.component';
import { ControlCampoDirective } from '../../../shared/ui/campo-formulario/control-campo.directive';
import { IconoComponent } from '../../../shared/ui/icono/icono.component';
import { aplicarErroresServidor } from '../../../shared/utils/aplicar-errores-servidor';
import { conIndicador } from '../../../shared/utils/con-indicador';
import { enfocarPrimerError } from '../../../shared/utils/enfocar-error';
import { rutaInternaSegura } from '../../../shared/utils/ruta-segura';
import { correoValidator, normalizarCorreo } from '../../../shared/validators';
import { TEXTOS_LOGIN } from '../auth.textos';

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    BotonComponent,
    CampoFormularioComponent,
    ControlCampoDirective,
    IconoComponent,
  ],
  templateUrl: './login-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  /** Ruta a la que volver tras ingresar (query param `?volver=`). */
  readonly volver = input<string>();

  private readonly authApi = inject(AuthApiService);
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly textos = TEXTOS_LOGIN;
  protected readonly cargando = signal(false);
  protected readonly errorGeneral = signal<string | null>(null);
  protected readonly form = inject(NonNullableFormBuilder).group({
    correo: ['', [Validators.required, correoValidator()]],
    contrasena: ['', [Validators.required]],
  });

  protected enviar(): void {
    this.errorGeneral.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      enfocarPrimerError(this.host.nativeElement);
      return;
    }
    const { correo, contrasena } = this.form.getRawValue();
    this.authApi
      .iniciarSesion({ correo: normalizarCorreo(correo), contrasena })
      .pipe(conIndicador(this.cargando))
      .subscribe({
        next: (usuario) => this.entrar(usuario),
        error: (e: unknown) => {
          const error = comoApiError(e);
          if (
            !aplicarErroresServidor(this.form, error) &&
            tieneCodigo(error, 'CREDENCIALES_INVALIDAS')
          ) {
            this.errorGeneral.set(error.mensaje);
          }
        },
      });
  }

  private entrar(usuario: UsuarioPublico): void {
    this.sesion.establecer(usuario);
    const paso = siguientePaso(usuario);
    const destino = destinoPostRegistro();
    void this.router.navigateByUrl(
      paso === destino ? rutaInternaSegura(this.volver(), destino) : paso,
    );
  }
}
