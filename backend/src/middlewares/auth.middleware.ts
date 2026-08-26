// middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { UserRepository } from '../repositories/user/user.repository';

const userRepository = new UserRepository();

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  tokenUse: 'access',
  clientId: process.env.COGNITO_CLIENT_ID!,
});

export async function autenticazione(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ errore: { codice: 'TOKEN_MANCANTE', messaggio: 'Header Authorization con Bearer token richiesto' } });
    return;
  }

  const token = header.slice('Bearer '.length);
  try {
    const payload = await verifier.verify(token);
    const utente = await userRepository.findByCognitoSub(payload.sub);
    if (!utente) {
      res.status(401).json({ errore: { codice: 'UTENTE_NON_TROVATO', messaggio: 'Token valido ma nessun utente corrispondente nel sistema' } });
      return;
    }
    req.utente = utente;
    next();
  } catch (errore) {
    console.error('Verifica token fallita:', errore);
    res.status(401).json({ errore: { codice: 'TOKEN_NON_VALIDO', messaggio: 'Token scaduto, malformato o firma non valida' } });
  }
}

export function soloAmministratore(req: Request, res: Response, next: NextFunction): void {
  if (req.utente?.ruolo !== 'amministratore') {
    res.status(403).json({ errore: { codice: 'NON_AUTORIZZATO', messaggio: 'Operazione riservata agli amministratori' } });
    return;
  }
  next();
}