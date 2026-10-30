import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EnvironmentProviders, Provider } from '@angular/core';
import { Routes, provideRouter, withComponentInputBinding } from '@angular/router';
import { apiUrlInterceptor } from '../app/core/http/api-url.interceptor';
import { credencialesInterceptor } from '../app/core/http/credenciales.interceptor';
import { errorInterceptor } from '../app/core/http/error.interceptor';

/** HttpClient con los interceptores reales + backend de prueba + router vacío. */
export function proveedoresHttpPrueba(rutas: Routes = []): (Provider | EnvironmentProviders)[] {
  return [
    provideHttpClient(
      withInterceptors([apiUrlInterceptor, credencialesInterceptor, errorInterceptor]),
    ),
    provideHttpClientTesting(),
    provideRouter(rutas, withComponentInputBinding()),
  ];
}

export const API = '/api/v1';
