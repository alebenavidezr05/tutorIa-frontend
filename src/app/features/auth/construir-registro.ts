import { RegistroEntrada, TipoNivel } from '../../core/models';
import { normalizarCorreo, normalizarTexto } from '../../shared/validators';

export interface ValoresRegistro {
  nombre: string;
  correo: string;
  contrasena: string;
  fechaNacimiento: string;
  tipoNivel: TipoNivel | '';
  nivelEducativo: string;
  aceptaTratamiento: boolean;
  aceptaTransferenciaInternacional: boolean;
  aceptaPersonalizacion: boolean;
  aceptaComunicaciones: boolean;
  entiendeDatosMenor: boolean;
}

/**
 * Cuerpo de `POST /auth/registro`. Envía siempre la versión de la política que el usuario vio y
 * `entiende_datos_menor` solo si es menor de edad.
 */
export function construirRegistro(
  valores: ValoresRegistro,
  versionPolitica: string,
  esMenor: boolean,
): RegistroEntrada {
  return {
    nombre: normalizarTexto(valores.nombre),
    correo: normalizarCorreo(valores.correo),
    contrasena: valores.contrasena,
    fecha_nacimiento: valores.fechaNacimiento,
    tipo_nivel: valores.tipoNivel as TipoNivel,
    nivel_educativo: valores.nivelEducativo,
    version_politica: versionPolitica,
    acepta_tratamiento: valores.aceptaTratamiento,
    acepta_transferencia_internacional: valores.aceptaTransferenciaInternacional,
    acepta_personalizacion: valores.aceptaPersonalizacion,
    acepta_comunicaciones: valores.aceptaComunicaciones,
    ...(esMenor ? { entiende_datos_menor: valores.entiendeDatosMenor } : {}),
  };
}
