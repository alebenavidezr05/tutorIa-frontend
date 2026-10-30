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
  fecha_registro: FechaIso;
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
