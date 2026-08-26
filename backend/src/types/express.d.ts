// types/express.d.ts

import { Utente } from '../models/Utente';

declare global {
  namespace Express {
    interface Request {
      utente?: Utente;
    }
  }
}

export {};