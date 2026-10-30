import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/** Antepone `environment.apiBaseUrl` a las rutas relativas de la API (`/auth/login`). */
export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const esRutaApi = req.url.startsWith('/') && !req.url.startsWith('//');
  return next(esRutaApi ? req.clone({ url: `${environment.apiBaseUrl}${req.url}` }) : req);
};
