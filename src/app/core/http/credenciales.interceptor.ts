import { HttpInterceptorFn } from '@angular/common/http';
import { SIN_CREDENCIALES } from './contextos';

/** La sesión viaja en una cookie httpOnly que gestiona el backend: el cliente nunca ve el token. */
export const credencialesInterceptor: HttpInterceptorFn = (req, next) =>
  next(req.context.get(SIN_CREDENCIALES) ? req : req.clone({ withCredentials: true }));
