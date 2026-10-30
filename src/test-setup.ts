/**
 * Ajustes del entorno de pruebas (jsdom). jsdom no implementa `<dialog>.showModal()` ni
 * `scrollIntoView`; aquí se simulan de forma mínima.
 */
const prototipoDialogo = globalThis.HTMLDialogElement?.prototype;
if (prototipoDialogo && typeof prototipoDialogo.showModal !== 'function') {
  prototipoDialogo.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  prototipoDialogo.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
}

if (typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = () => undefined;
}

if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = () => 'blob:prueba';
  URL.revokeObjectURL = () => undefined;
}
