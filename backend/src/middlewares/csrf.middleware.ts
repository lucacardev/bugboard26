// middlewares/csrf.middleware.ts

import { Request, Response, NextFunction } from 'express';

/**
 * Protezione CSRF leggera per API JSON-only (nessun <form> HTML coinvolto).
 * Un <form> HTML non può aggiungere header custom; JavaScript esterno che
 * provasse ad aggiungerlo verrebbe bloccato dal preflight CORS prima che
 * la richiesta raggiunga qui (vedi cors({ origin: corsOrigin }) in index.ts).
 * Le sole GET non richiedono protezione, non modificano stato.
 */
export function verificaCsrf(req: Request, res: Response, next: NextFunction): void {
  if (req.method === 'GET') {
    next();
    return;
  }
  if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
    res.status(403).json({ errore: { codice: 'CSRF_SOSPETTO', messaggio: 'Header di sicurezza mancante' } });
    return;
  }
  next();
}