// controllers/auth/auth.controller.ts

import { Request, Response } from 'express';
import { CognitoService } from '../../services/user/cognito.service';

export class AuthController {
  constructor(private readonly cognitoService: CognitoService) {}

  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ errore: { codice: 'CAMPI_OBBLIGATORI_MANCANTI', messaggio: 'Campi obbligatori mancanti: email, password' } });
      return;
    }
    try {
      const risultato = await this.cognitoService.login(email, password);
      res.status(200).json(risultato);
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
      res.status(200).json(risultato);
    } catch (errore) {
      console.error('Errore durante il completamento del primo accesso:', errore);
      res.status(401).json({ errore: { codice: 'SFIDA_NON_VALIDA', messaggio: 'Sessione scaduta o password non corretta' } });
    }
  };
}