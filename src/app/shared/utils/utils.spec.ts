import { signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject, of, throwError } from 'rxjs';
import { ApiError } from '../../core/models';
import { aplicarErroresServidor, snakeACamel } from './aplicar-errores-servidor';
import { avisoDeError, MENSAJE_LIMITE_USO } from './aviso-error';
import { conIndicador } from './con-indicador';
import { referenciasComoTexto, fuenteAReferencia, rotuloCategoriaFuente } from './referencias';
import { resolverUrlApi } from './resolver-url-api';
import { rutaInternaSegura } from './ruta-segura';
import { dividirEnSecciones } from './secciones-texto';
import { fuentePrueba } from '../../../testing/datos-prueba';

function error(codigo: string, detalles: ApiError['detalles'] = null): ApiError {
  return { status: 422, codigo, mensaje: `Mensaje ${codigo}`, detalles };
}

describe('aplicarErroresServidor', () => {
  it('asigna cada detalle al control con el mismo nombre (snake_case → camelCase)', () => {
    const form = new FormGroup({
      fechaNacimiento: new FormControl(''),
      nombre: new FormControl(''),
    });
    const aplicado = aplicarErroresServidor(
      form,
      error('DATO_INVALIDO', [
        { campo: 'fecha_nacimiento', mensaje: 'Fecha inválida' },
        { campo: 'body.nombre', mensaje: 'Nombre corto' },
        { campo: 'inexistente', mensaje: 'x' },
      ]),
    );
    expect(aplicado).toBe(true);
    expect(form.controls.fechaNacimiento.errors).toEqual({ servidor: 'Fecha inválida' });
    expect(form.controls.nombre.errors).toEqual({ servidor: 'Nombre corto' });
    expect(form.controls.nombre.touched).toBe(true);
  });

  it('devuelve false si no hay detalles', () => {
    expect(aplicarErroresServidor(new FormGroup({}), error('X'))).toBe(false);
  });

  it('snakeACamel', () => {
    expect(snakeACamel('acepta_transferencia_internacional')).toBe(
      'aceptaTransferenciaInternacional',
    );
  });
});

describe('conIndicador', () => {
  it('pone la señal en true al suscribirse y en false al terminar', () => {
    const cargando = signal(false);
    const fuente = new Subject<number>();
    fuente.pipe(conIndicador(cargando)).subscribe();
    expect(cargando()).toBe(true);
    fuente.complete();
    expect(cargando()).toBe(false);
  });

  it('también vuelve a false con error', () => {
    const cargando = signal(false);
    throwError(() => new Error('x'))
      .pipe(conIndicador(cargando))
      .subscribe({ error: () => undefined });
    expect(cargando()).toBe(false);
  });

  it('no cambia la señal hasta que alguien se suscribe', () => {
    const cargando = signal(false);
    of(1).pipe(conIndicador(cargando));
    expect(cargando()).toBe(false);
  });
});

describe('avisoDeError', () => {
  it('traduce los códigos de pantalla', () => {
    expect(avisoDeError(error('LIMITE_USO'))).toEqual({
      tipo: 'limite',
      mensaje: MENSAJE_LIMITE_USO,
    });
    expect(avisoDeError(error('FUNCION_PREMIUM'))?.tipo).toBe('premium');
    expect(avisoDeError(error('COMPRA_NO_PERMITIDA'))?.tipo).toBe('compra');
    expect(avisoDeError(error('LLM_NO_DISPONIBLE'))?.tipo).toBe('reintentar');
    expect(avisoDeError(error('OTRO'))).toBeNull();
  });
});

describe('resolverUrlApi', () => {
  it('antepone el origen de apiBaseUrl a las rutas de la API', () => {
    expect(resolverUrlApi('/api/v1/visuales/1', '/api/v1')).toBe('/api/v1/visuales/1');
    expect(resolverUrlApi('/api/v1/visuales/1', 'https://api.tutoria.co/api/v1')).toBe(
      'https://api.tutoria.co/api/v1/visuales/1',
    );
  });

  it('rechaza URLs de terceros', () => {
    expect(resolverUrlApi('https://upload.wikimedia.org/x.jpg', '/api/v1')).toBeNull();
    expect(resolverUrlApi('//evil.com/x', '/api/v1')).toBeNull();
    expect(resolverUrlApi('javascript:alert(1)', '/api/v1')).toBeNull();
  });
});

describe('rutaInternaSegura', () => {
  it('solo acepta rutas internas', () => {
    expect(rutaInternaSegura('/plan/1', '/tema')).toBe('/plan/1');
    expect(rutaInternaSegura('//evil.com', '/tema')).toBe('/tema');
    expect(rutaInternaSegura('https://evil.com', '/tema')).toBe('/tema');
    expect(rutaInternaSegura(undefined, '/tema')).toBe('/tema');
  });
});

describe('dividirEnSecciones', () => {
  it('convierte Markdown simple en secciones de texto plano', () => {
    const secciones = dividirEnSecciones(
      '# Política\n\n> Plantilla\n\n**Responsable:** X.\n\n## 1. Datos\nNombre y\ncorreo.\n- uno\n- dos',
    );
    expect(secciones[0]?.titulo).toBe('Política');
    expect(secciones[0]?.bloques).toEqual([
      { tipo: 'nota', texto: 'Plantilla' },
      { tipo: 'parrafo', texto: 'Responsable: X.' },
    ]);
    expect(secciones[1]?.bloques).toEqual([
      { tipo: 'parrafo', texto: 'Nombre y correo.' },
      { tipo: 'lista', items: ['uno', 'dos'] },
    ]);
  });

  it('no interpreta HTML: queda como texto', () => {
    const [seccion] = dividirEnSecciones('<img src=x onerror=alert(1)>');
    expect(seccion?.bloques[0]).toEqual({ tipo: 'parrafo', texto: '<img src=x onerror=alert(1)>' });
  });
});

describe('referencias', () => {
  it('rotula la categoría con texto y solo acepta enlaces http(s)', () => {
    const vista = fuenteAReferencia(
      fuentePrueba({ url: 'javascript:alert(1)', doi: '10.1000/xyz123' }),
    );
    expect(vista.rotulo).toBe('Material educativo');
    expect(vista.url).toBeNull();
    expect(vista.doi).toBe('https://doi.org/10.1000/xyz123');
  });

  it('rotula PRENSA_CONFIABLE como «Nota de prensa»', () => {
    expect(rotuloCategoriaFuente('PRENSA_CONFIABLE')).toBe('Nota de prensa');
    expect(fuenteAReferencia(fuentePrueba({ categoria: 'PRENSA_CONFIABLE' })).rotulo).toBe(
      'Nota de prensa',
    );
  });

  it('usa el rótulo genérico «Fuente» para categorías desconocidas', () => {
    expect(rotuloCategoriaFuente('CATEGORIA_FUTURA')).toBe('Fuente');
    expect(rotuloCategoriaFuente('toString')).toBe('Fuente');
    expect(rotuloCategoriaFuente(null)).toBe('Fuente');
    const fuente = fuentePrueba({ categoria: 'CATEGORIA_FUTURA' as never });
    expect(fuenteAReferencia(fuente).rotulo).toBe('Fuente');
  });

  it('referenciasComoTexto une las referencias APA', () => {
    expect(
      referenciasComoTexto([
        { tipo: 'TEXTO', texto_apa: 'A. (2020). Uno.', url: null },
        { tipo: 'VIDEO', texto_apa: 'B. (2021). Dos.', url: null },
      ]),
    ).toBe('A. (2020). Uno.\n\nB. (2021). Dos.');
  });
});
