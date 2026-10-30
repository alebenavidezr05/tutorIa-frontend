export const TEXTOS_SOLICITAR = {
  titulo: 'Autorización del adulto responsable',
  intro:
    'Si eres la madre, el padre o el representante legal de un estudiante menor de edad, aquí autorizas que use TutorIA. No necesitas crear una cuenta.',
  correoAcudiente: 'Tu correo (adulto responsable)',
  correoEstudiante: 'Correo del estudiante',
  ayudaEstudiante: 'El mismo correo con el que el estudiante se registró o se registrará.',
  declaracion: 'Declaro que soy el padre, madre o representante legal de este estudiante.',
  prefijoRepresentante: 'Como representante legal del estudiante: ',
  verPolitica: 'Leer la política de tratamiento de datos',
  version: 'Versión de la política',
  boton: 'Enviar y recibir el correo de confirmación',
  enviadoTitulo: 'Revisa tu correo',
  enviado:
    'Si los datos son correctos, enviamos un correo al adulto responsable para confirmar la autorización. Revisa también la carpeta de spam.',
  otraVez: 'Enviar otra solicitud',
  politicaNoCargo: 'No pudimos cargar la política de tratamiento de datos. Inténtalo de nuevo.',
  reintentar: 'Reintentar',
  politicaActualizada:
    'La política de datos se acaba de actualizar. Revisa los textos y vuelve a marcar las autorizaciones.',
} as const;

export const TEXTOS_CONFIRMAR = {
  titulo: 'Autorización de la cuenta',
  cargando: 'Revisando el enlace…',
  sinToken: 'Este enlace no es válido. Ábrelo directamente desde el correo que te enviamos.',
  invalido: 'El enlace de autorización no es válido o ya venció.',
  pedirNuevo: 'Pedir un enlace nuevo',
  errorGeneral: 'No pudimos revisar el enlace en este momento.',
  reintentar: 'Reintentar',
  estudiante: 'Cuenta del estudiante',
  queAutorizas: 'Qué estás autorizando',
  explicacion: [
    'TutorIA guarda el nombre, correo, fecha de nacimiento, nivel educativo y las sesiones de estudio del estudiante.',
    'Las explicaciones las genera una inteligencia artificial (proveedores fuera de Colombia). No se usan para publicidad ni se venden.',
    'Puedes revocar esta autorización cuando quieras desde este mismo enlace mientras esté vigente, o escribiendo al responsable.',
  ],
  comprasSi: 'Permitiste que el estudiante contrate planes de pago.',
  comprasNo: 'No permitiste que el estudiante contrate planes de pago.',
  vence: 'Este enlace vence el',
  autorizar: 'Autorizar',
  noAutorizo: 'No autorizo',
  noAutorizoTitulo: '¿No autorizas la cuenta?',
  noAutorizoTexto:
    'La cuenta del estudiante no se activará y no podrá usar TutorIA. Puedes pedir un enlace nuevo más adelante.',
  noAutorizoConfirmar: 'No autorizo',
  autorizada: 'La cuenta está autorizada. El estudiante ya puede usar TutorIA.',
  revocar: 'Revocar autorización',
  revocarTitulo: '¿Revocar la autorización?',
  revocarTexto: 'El estudiante dejará de tener acceso a TutorIA.',
  eliminarDatos: 'Eliminar también los datos del estudiante',
  eliminarDatosAyuda:
    'Se borran su perfil, planes, conversaciones y archivos. Se conserva solo lo que la ley obliga a guardar.',
  revocada: 'La autorización fue revocada. El estudiante no puede usar TutorIA.',
  vencida: 'Este enlace ya venció. Puedes pedir uno nuevo.',
  exitoAutorizar: '¡Gracias! La cuenta quedó autorizada.',
  exitoRevocar: 'La autorización quedó revocada.',
} as const;
