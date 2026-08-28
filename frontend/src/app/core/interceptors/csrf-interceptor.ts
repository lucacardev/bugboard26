import { HttpInterceptorFn } from '@angular/common/http';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method === 'GET') {
    return next(req);
  }

  const richiestaConHeader = req.clone({
    setHeaders: { 'X-Requested-With': 'XMLHttpRequest' }
  });

  return next(richiestaConHeader);
};