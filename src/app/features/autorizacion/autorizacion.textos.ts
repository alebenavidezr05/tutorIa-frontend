export const TEXTOS_CONFIRMAR = {
  titulo: 'Autorización de la cuenta',
  cargando: 'Revisando el enlace…',
  necesita: (nombre: string) => `${nombre} necesita tu autorización`,
  resumen: [
    {
      icono: 'ia',
      texto: 'TutorIA es un tutor con inteligencia artificial que acompaña a estudiar paso a paso.',
    },
    {
      icono: 'candado',
      texto: 'Usa su nombre, su correo y lo que estudia, solo para personalizar su aprendizaje.',
    },
    {
      icono: 'check',
      texto: 'Tú decides: puedes retirar la autorización cuando quieras desde este mismo enlace.',
    },
  ],
  verPolitica: 'Política de tratamiento de datos',
  autorizo: 'Autorizo',
  noAutorizo: 'No autorizo',
  politicaActualizada:
    'La política de datos se acaba de actualizar. Lee el texto nuevo antes de decidir.',
  autorizada: (nombre: string) =>
    `¡Listo! ${nombre} ya puede usar TutorIA. Gracias por acompañarle.`,
  rechazada: 'Entendido. No activaremos la cuenta.',
  invalido:
    'Este enlace ya no es válido. Pídele a quien se registró que te envíe uno nuevo desde TutorIA.',
  errorGeneral: 'Algo no salió como esperaba. Intentémoslo de nuevo.',
  reintentar: 'Reintentar',
  retirar: 'Retirar autorización',
  retirarTitulo: '¿Retirar la autorización?',
  retirarTexto: 'El estudiante dejará de tener acceso a TutorIA.',
  eliminarDatos: 'Eliminar también sus datos',
  eliminarDatosAyuda:
    'Se borran su perfil, planes, conversaciones y archivos. Se conserva solo lo que la ley obliga a guardar.',
  retirada: (nombre: string) => `Retiraste la autorización. ${nombre} ya no puede usar TutorIA.`,
} as const;
