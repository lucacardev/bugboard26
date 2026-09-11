// controllers/auth/auth.controller.ts

import { Request, Response } from 'express';
import { CognitoService } from '../../services/user/cognito.service';
import { UserRepository } from '../../repositories/user/user.repository';

const OPZIONI_COOKIE = {
  httpOnly: true,
  // Deliberatamente disaccoppiato da NODE_ENV: quest'ultimo indica solo se
  // il codice gira in build di produzione, non se esiste un HTTPS reale
  // davanti al server (es. un deploy demo su IP pubblico senza dominio/TLS
  // configurato). Un cookie Secure non viene mai inviato dal browser su
  // connessioni HTTP semplici — eccetto l'eccezione speciale che i browser
  // riservano a "localhost", che non si applica a un IP pubblico reale.
  // Default a 'true' (sicuro) a meno che non sia esplicitamente disattivato.
  secure: process.env.COOKIE_SECURE !== 'false',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 1000, // 1 ora, coerente con la scadenza dell'accessToken Cognito
};

export class AuthController {
  constructor(
    private readonly cognitoService: CognitoService,
    private readonly userRepository: UserRepository
  ) {}

  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ errore: { codice: 'CAMPI_OBBLIGATORI_MANCANTI', messaggio: 'Campi obbligatori mancanti: email, password' } });
      return;
    }
    try {
      const risultato = await this.cognitoService.login(email, password);
      if (risultato.richiedeNuovaPassword) {
        res.status(200).json(risultato);
        return;
      }
      res.cookie('accessToken', risultato.accessToken, OPZIONI_COOKIE);
      res.status(200).json({ richiedeNuovaPassword: false });
    } catch (errore) {
      console.error('Errore durante il login:', errore);
      res.status(401).json({ errore: { codice: 'CREDENZIALI_NON_VALIDE', messaggio: 'Email o password non corrette' } });
    }
  };

  completaPrimoAccesso = async (req: Request, res: Response): Promise<void> => {
    const { email, nuovaPassword, session } = req.body;
    if (!email || !nuovaPassword || !session) {
      res.status(400).json({ errore: { codice: 'CAMPI_OBBLIGATORI_MANCANTI', messaggio: 'Campi obbligatori mancanti: email, nuovaPassword, session' } });
      return;
    }
    try {
      const risultato = await this.cognitoService.completaPrimoAccesso(email, nuovaPassword, session);
      await this.userRepository.attivaUtenteByEmail(email);
      res.cookie('accessToken', risultato.accessToken, OPZIONI_COOKIE);
      res.status(200).json({ richiedeNuovaPassword: false });
    } catch (errore) {
      console.error('Errore durante il completamento del primo accesso:', errore);
      res.status(401).json({ errore: { codice: 'SFIDA_NON_VALIDA', messaggio: 'Sessione scaduta o password non corretta' } });
    }
  };

  me = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json(req.utente);
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    res.clearCookie('accessToken', OPZIONI_COOKIE);
    res.status(200).json({ messaggio: 'Logout effettuato' });
  };
}