import { FormControl, FormGroup } from '@angular/forms';
import {
  validarArchivo,
  archivoValidator,
  tipoDeArchivo,
  TAMANO_MAXIMO_ARCHIVO,
} from './archivo.validator';
import { contrasenaValidator } from './contrasena.validator';
import { correoValidator, correosDistintosValidator } from './correo.validator';
import { esMenorDeEdad, fechaNacimientoValidator } from './fecha-nacimiento.validator';
import { mensajeDeError } from './mensajes-validacion';
import { nivelEducativoValidator } from './nivel-educativo.validator';
import { nombreValidator } from './nombre.validator';
import { temaValidator } from './tema.validator';

describe('validadores', () => {
  describe('temaValidator', () => {
    const validar = (valor: string) => temaValidator()(new FormControl(valor));

    it('acepta un tema de estudio', () => {
      expect(validar('Fracciones equivalentes')).toBeNull();
    });

    it('exige entre 3 y 200 caracteres tras normalizar espacios', () => {
      expect(validar('  ab  ')).toEqual({ temaLongitud: { min: 3, max: 200, actual: 2 } });
      expect(validar('a'.repeat(201))).not.toBeNull();
    });

    it('rechaza pedir que le resuelvan la tarea (también sin tildes ni mayúsculas)', () => {
      expect(validar('Resuélveme este ejercicio')).toEqual({ resolverTarea: true });
      expect(validar('hazme la tarea de química')).toEqual({ resolverTarea: true });
      expect(validar('DAME LAS RESPUESTAS del examen')).toEqual({ resolverTarea: true });
    });

    it('deja el vacío a Validators.required', () => {
      expect(validar('')).toBeNull();
    });
  });

  describe('contrasenaValidator', () => {
    const validar = (valor: string) => contrasenaValidator()(new FormControl(valor));

    it('acepta 8–64 caracteres con letra y número', () => {
      expect(validar('clave123')).toBeNull();
    });

    it('rechaza cortas, sin número y demasiado largas', () => {
      expect(validar('abc1')).toHaveProperty('contrasenaLongitud');
      expect(validar('soloLetras')).toEqual({ contrasenaComposicion: true });
      expect(validar('a1'.repeat(33))).toHaveProperty('contrasenaLongitud');
      expect(validar('ñ'.repeat(40) + '1')).toEqual({ contrasenaBytes: true });
    });
  });

  describe('correo', () => {
    it('valida el formato', () => {
      expect(correoValidator()(new FormControl('ana@correo.com'))).toBeNull();
      expect(correoValidator()(new FormControl('ana@correo'))).toEqual({ correo: true });
    });

    it('correosDistintosValidator marca el segundo campo si son iguales', () => {
      const grupo = new FormGroup(
        { a: new FormControl('Mama@Correo.com'), b: new FormControl('mama@correo.com ') },
        { validators: correosDistintosValidator('a', 'b') },
      );
      expect(grupo.hasError('correosIguales')).toBe(true);
      expect(grupo.controls.b.hasError('correosIguales')).toBe(true);
      grupo.controls.b.setValue('hijo@correo.com');
      expect(grupo.valid).toBe(true);
      expect(grupo.controls.b.errors).toBeNull();
    });
  });

  it('nombreValidator exige 2–100 caracteres', () => {
    expect(nombreValidator()(new FormControl('A'))).toHaveProperty('nombreLongitud');
    expect(nombreValidator()(new FormControl('Ana'))).toBeNull();
  });

  it('nivelEducativoValidator depende del tipo de nivel', () => {
    const grupo = new FormGroup({
      tipoNivel: new FormControl('COLEGIO'),
      nivelEducativo: new FormControl('', nivelEducativoValidator()),
    });
    grupo.controls.nivelEducativo.setValue('Pregrado');
    expect(grupo.controls.nivelEducativo.hasError('nivelEducativo')).toBe(true);
    grupo.controls.nivelEducativo.setValue('10');
    expect(grupo.controls.nivelEducativo.valid).toBe(true);
  });

  describe('fechaNacimientoValidator', () => {
    const hoy = () => new Date(2026, 9, 18);
    const validar = (valor: string) => fechaNacimientoValidator({ hoy })(new FormControl(valor));

    it('acepta 13 años cumplidos', () => {
      expect(validar('2013-10-18')).toBeNull();
    });

    it('rechaza menores de 13', () => {
      expect(validar('2013-10-19')).toEqual({ edadMinima: { min: 13 } });
    });

    it('rechaza fechas futuras e inválidas', () => {
      expect(validar('2026-10-19')).toEqual({ fechaFutura: true });
      expect(validar('2010-02-31')).toEqual({ fechaInvalida: true });
    });

    it('esMenorDeEdad: 17 sí, 18 no', () => {
      expect(esMenorDeEdad('2009-01-01', hoy())).toBe(true);
      expect(esMenorDeEdad('2008-10-18', hoy())).toBe(false);
    });
  });

  describe('archivo', () => {
    const archivo = (nombre: string, tipo: string, tamano: number) =>
      ({ name: nombre, type: tipo, size: tamano }) as File;

    it('acepta texto, PDF e imágenes de hasta 5 MB', () => {
      expect(validarArchivo(archivo('a.pdf', 'application/pdf', 1000))).toBeNull();
      expect(validarArchivo(archivo('a.png', 'image/png', TAMANO_MAXIMO_ARCHIVO))).toBeNull();
      expect(validarArchivo(archivo('a.txt', '', 10))).toBeNull();
    });

    it('rechaza tipos no permitidos, vacíos y más de 5 MB', () => {
      expect(validarArchivo(archivo('a.exe', 'application/x-msdownload', 10))).toBe('archivoTipo');
      expect(validarArchivo(archivo('a.png', 'image/png', TAMANO_MAXIMO_ARCHIVO + 1))).toBe(
        'archivoTamano',
      );
      expect(validarArchivo(archivo('a.png', 'image/png', 0))).toBe('archivoVacio');
    });

    it('deduce el tipo por extensión si el navegador no lo informa', () => {
      expect(tipoDeArchivo({ name: 'foto.JPG', type: '' })).toBe('image/jpeg');
    });

    it('archivoValidator funciona sobre un FormControl<File>', () => {
      const control = new FormControl<File | null>(
        new File(['x'], 'virus.exe', { type: 'application/x-msdownload' }),
        archivoValidator(),
      );
      expect(control.hasError('archivoTipo')).toBe(true);
    });
  });

  it('mensajeDeError prioriza el mensaje del servidor', () => {
    expect(mensajeDeError({ required: true, servidor: 'Ese correo ya existe' })).toBe(
      'Ese correo ya existe',
    );
    expect(mensajeDeError({ requiredTrue: true })).toBe(
      'Debes marcar esta casilla para continuar.',
    );
    expect(mensajeDeError(null)).toBeNull();
  });
});
