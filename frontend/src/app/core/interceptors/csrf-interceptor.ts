import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo per il nostro backend: l'upload diretto verso S3 (URL presigned) non
  // deve ricevere questo header extra, altrimenti farebbe scattare un
  // preflight CORS che il bucket non è configurato ad accettare, e comunque
  // non fa parte della firma dell'URL presigned.
  if (req.method === 'GET' || !req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const richiestaConHeader = req.clone({
    setHeaders: { 'X-Requested-With': 'XMLHttpRequest' }
  });

  return next(richiestaConHeader);
};