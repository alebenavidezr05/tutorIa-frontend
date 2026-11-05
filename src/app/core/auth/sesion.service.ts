import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { AuthApiService } from '../api/auth-api.service';
import { CapacidadesService } from './capacidades.service';
import { UsuarioPublico } from '../models';

/**
 * Estado de sesión en memoria. El token vive en una cookie httpOnly gestionada por el backend;
 * aquí solo se guarda el usuario público y nunca se persiste en el navegador.
 */
@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly authApi = inject(AuthApiService);
  private readonly capacidades = inject(CapacidadesService);
  private readonly _usuario = signal<UsuarioPublico | null>(null);
  private restauracionInicial: Promise<UsuarioPublico | null> | null = null;

  readonly usuario = this._usuario.asReadonly();
  readonly autenticado = computed(() => this._usuario() !== null);
  /** Correo confirmado y cuenta ACTIVA: ya puede usar las rutas de la aplicación. */
  readonly cuentaActiva = computed(() => {
    const usuario = this._usuario();
    return usuario?.estado_cuenta === 'ACTIVA' && usuario.correo_verificado !== false;
  });

  /**
   * Consulta `/auth/me`. Si no hay sesión deja `null` sin notificar. También reemplaza lo que
   * leen los guards (`asegurarRestaurada`), para que no decidan con un usuario viejo.
   */
  restaurar(): Promise<UsuarioPublico | null> {
    const promesa = new Promise<UsuarioPublico | null>((resolver) => {
      this.authApi.obtenerActual({ silencioso: true }).subscribe({
        next: (usuario) => {
          this._usuario.set(usuario);
          resolver(usuario);
        },
        error: () => {
          this._usuario.set(null);
          resolver(null);
        },
      });
    });
    this.restauracionInicial = promesa;
    return promesa;
  }

  /** Restaura la sesión una sola vez al cargar la app (lo usan los guards). */
  asegurarRestaurada(): Promise<UsuarioPublico | null> {
    return this.restauracionInicial ?? this.restaurar();
  }

  establecer(usuario: UsuarioPublico): void {
    this._usuario.set(usuario);
    this.restauracionInicial = Promise.resolve(usuario);
  }

  /** Olvida la sesión local (lo usa el interceptor ante `SESION_INVALIDA`). */
  limpiar(): void {
    this._usuario.set(null);
    this.capacidades.limpiar();
    this.restauracionInicial = Promise.resolve(null);
  }

  /** Cierra la sesión en el backend y la limpia localmente pase lo que pase. */
  cerrar(): Observable<void> {
    return this.authApi.cerrarSesion().pipe(finalize(() => this.limpiar()));
  }
}
