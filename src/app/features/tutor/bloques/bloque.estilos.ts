/** Estilos compartidos por los bloques de texto del tutor (texto plano, nunca innerHTML). */
export const ESTILOS_BLOQUE = `
  :host {
    display: block;
  }

  .contenido {
    white-space: pre-line;
    margin-bottom: var(--espacio-2);
  }

  .recuadro {
    padding: var(--espacio-3) var(--espacio-4);
    border-left: 4px solid var(--color-acento);
    border-radius: var(--radio-sm);
    background: var(--color-fondo-alterno);
  }

  .rotulo {
    margin: 0 0 var(--espacio-1);
    font-size: var(--texto-sm);
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  h4 {
    font-family: var(--fuente-cuerpo);
    font-size: var(--texto-base);
    font-weight: 800;
    margin-bottom: var(--espacio-2);
  }

  ol {
    padding-left: var(--espacio-5);
  }

  li + li {
    margin-top: var(--espacio-1);
  }
`;
