import { AbstractControl, ValidatorFn } from '@angular/forms';
import { TipoNivel } from '../../core/models';
import { _textoDe } from './texto.validator';

export interface OpcionNivel {
  readonly valor: string;
  readonly etiqueta: string;
}

/** Espejo de `NIVELES_POR_TIPO` del backend. El `valor` es exactamente lo que espera la API. */
export const NIVELES_POR_TIPO: Record<TipoNivel, readonly OpcionNivel[]> = {
  COLEGIO: [
    { valor: '8', etiqueta: '8.° grado' },
    { valor: '9', etiqueta: '9.° grado' },
    { valor: '10', etiqueta: '10.° grado' },
    { valor: '11', etiqueta: '11.° grado' },
  ],
  UNIVERSIDAD_TECNICA: [
    { valor: 'Técnico', etiqueta: 'Técnico' },
    { valor: 'Tecnólogo', etiqueta: 'Tecnólogo' },
    { valor: 'Pregrado', etiqueta: 'Pregrado' },
    { valor: 'Posgrado', etiqueta: 'Posgrado' },
  ],
};

export function _esTipoNivel(valor: unknown): valor is TipoNivel {
  return valor === 'COLEGIO' || valor === 'UNIVERSIDAD_TECNICA';
}

function _permitido(tipo: TipoNivel, nivel: string): boolean {
  return NIVELES_POR_TIPO[tipo].some((opcion) => opcion.valor === nivel);
}

function _tipoHermano(control: AbstractControl, campoTipo: string): unknown {
  return control.parent?.get(campoTipo)?.value;
}

/**
 * El nivel educativo debe pertenecer al tipo de nivel elegido en el control hermano `campoTipo`.
 * Se aplica al control del nivel para que el error aparezca junto a él.
 */
export function nivelEducativoValidator(campoTipo = 'tipoNivel'): ValidatorFn {
  return (control) => {
    const nivel = _textoDe(control);
    const tipo = _tipoHermano(control, campoTipo);
    if (nivel === '' || !_esTipoNivel(tipo)) {
      return null;
    }
    return _permitido(tipo, nivel) ? null : { nivelEducativo: true };
  };
}
