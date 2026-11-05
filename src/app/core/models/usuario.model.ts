import { EstadoCuenta, FechaIso, TipoNivel, Uuid } from './comunes.model';

/** Nunca trae la fecha de nacimiento. */
export interface UsuarioPublico {
  id_usuario: Uuid;
  nombre: string;
  correo: string;
  tipo_nivel: TipoNivel;
  nivel_educativo: string;
  estado_cuenta: EstadoCuenta;
  es_menor: boolean;
  /** Mientras sea `false`, el backend responde 403 CORREO_NO_VERIFICADO en las rutas de uso. */
  correo_verificado: boolean;
  fecha_registro: FechaIso;
}

/** `GET /auth/verificar-correo/estado` */
export interface EstadoVerificacionCorreo {
  correo_verificado: boolean;
  correo_enmascarado: string;
  puede_reenviar_en_segundos: number;
}

/** `POST /auth/verificar-correo`. Solo `VERIFICADO` cuenta como éxito. */
export interface VerificacionCorreoRespuesta {
  estado: 'VERIFICADO' | string;
}

export interface RegistroEntrada {
  nombre: string;
  correo: string;
  contrasena: string;
  /** AAAA-MM-DD */
  fecha_nacimiento: string;
  tipo_nivel: TipoNivel;
  nivel_educativo: string;
  version_politica: string;
  acepta_tratamiento: boolean;
  acepta_transferencia_internacional: boolean;
  acepta_personalizacion?: boolean;
  acepta_comunicaciones?: boolean;
  entiende_datos_menor?: boolean;
  /** Obligatorio si tiene entre 13 y 17 años; el servidor decide. */
  correo_acudiente?: string;
}

export interface LoginEntrada {
  correo: string;
  contrasena: string;
}

export interface ActualizarPerfilEntrada {
  nombre: string;
  tipo_nivel: TipoNivel;
  nivel_educativo: string;
}
