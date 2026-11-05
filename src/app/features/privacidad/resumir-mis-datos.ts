import { MisDatos, RegistroDatos } from '../../core/models';

export interface FilaDato {
  readonly etiqueta: string;
  readonly valor: string;
}

export interface ResumenMisDatos {
  readonly cuenta: readonly FilaDato[];
  readonly perfil: readonly FilaDato[];
  readonly contenido: readonly FilaDato[];
}

const ETIQUETAS: Readonly<Record<string, string>> = {
  nombre: 'Nombre',
  correo: 'Correo',
  fecha_nacimiento: 'Fecha de nacimiento',
  tipo_nivel: 'Tipo de nivel',
  nivel_educativo: 'Nivel educativo',
  estado_cuenta: 'Estado de la cuenta',
  fecha_registro: 'Fecha de registro',
  personalizacion_activa: 'Personalización activa',
  total_interacciones: 'Interacciones registradas',
  resumen: 'Resumen',
  detalle: 'Nivel de detalle preferido',
  ritmo: 'Ritmo',
};

/** Claves técnicas que no aportan al titular. */
const OMITIDAS = new Set(['id_usuario', 'id', 'hash', 'indice']);

function _etiqueta(clave: string): string {
  const legible = clave.replace(/_/g, ' ');
  return ETIQUETAS[clave] ?? legible.charAt(0).toUpperCase() + legible.slice(1);
}

function _valor(valor: unknown): string | null {
  if (typeof valor === 'string') {
    return valor.trim() === '' ? null : valor;
  }
  if (typeof valor === 'number') {
    return String(valor);
  }
  if (typeof valor === 'boolean') {
    return valor ? 'Sí' : 'No';
  }
  return null;
}

function _filas(registro: RegistroDatos): FilaDato[] {
  return Object.entries(registro)
    .filter(([clave]) => !OMITIDAS.has(clave))
    .map(([clave, valor]) => ({ etiqueta: _etiqueta(clave), valor: _valor(valor) }))
    .filter((fila): fila is FilaDato => fila.valor !== null);
}

function _cantidad(cantidad: number, singular: string, plural: string): string {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}

/** Convierte la respuesta de GET /privacidad/mis-datos en filas en lenguaje claro. */
export function resumirMisDatos(datos: MisDatos): ResumenMisDatos {
  return {
    cuenta: _filas(datos.usuario),
    perfil: _filas(datos.perfil_aprendizaje),
    contenido: [
      { etiqueta: 'Planes de estudio', valor: _cantidad(datos.planes.length, 'plan', 'planes') },
      {
        etiqueta: 'Conversaciones con Vex',
        valor: _cantidad(datos.conversaciones.length, 'conversación', 'conversaciones'),
      },
      {
        etiqueta: 'Archivos entregados',
        valor: _cantidad(datos.archivos.length, 'archivo', 'archivos'),
      },
      {
        etiqueta: 'Solicitudes',
        valor: _cantidad(datos.solicitudes.length, 'solicitud', 'solicitudes'),
      },
    ],
  };
}
