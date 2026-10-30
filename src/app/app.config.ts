import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import localeEsCo from '@angular/common/locales/es-CO';
import {
  ApplicationConfig,
  ErrorHandler,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { routes } from './app.routes';
import { ManejadorErroresGlobal } from './core/errores/manejador-errores-global';
import { TituloEstrategia } from './core/errores/titulo-estrategia';
import { apiUrlInterceptor } from './core/http/api-url.interceptor';
import { credencialesInterceptor } from './core/http/credenciales.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';

registerLocaleData(localeEsCo);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
    ),
    // XHR: necesario para el progreso de subida de archivos (fetch no lo informa).
    provideHttpClient(
      withXhr(),
      withInterceptors([apiUrlInterceptor, credencialesInterceptor, errorInterceptor]),
    ),
    { provide: LOCALE_ID, useValue: 'es-CO' },
    { provide: ErrorHandler, useClass: ManejadorErroresGlobal },
    { provide: TitleStrategy, useClass: TituloEstrategia },
  ],
};
