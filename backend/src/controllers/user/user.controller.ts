// controllers/user/user.controller.ts

import { Request, Response } from 'express';
import { UserService } from '../../services/user/user.service';

export class UserController {
  constructor(private userService: UserService) {}

  getUtente = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const utente = await this.userService.getUtente(id);
      res.status(200).json(utente);
    } catch (errore) {
      if (errore instanceof Error && errore.message === 'UTENTE_NON_TROVATO') {
        res.status(404).json({ errore: { codice: 'UTENTE_NON_TROVATO', messaggio: 'Nessun utente trovato con questo id' } });
        return;
      }
      console.error('Errore durante il recupero dell\'utente:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante il recupero dell\'utente' } });
    }
  };

  getMembriTeam = async (req: Request, res: Response): Promise<void> => {
    try {
      const teamId = Number(req.params.teamId);
      const membri = await this.userService.getMembriTeam(teamId);
      res.status(200).json(membri);
    } catch (errore) {
      console.error('Errore durante il recupero dei membri:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante il recupero dei membri' } });
    }
  };

  creaUtente = async (req: Request, res: Response): Promise<void> => {
    const { username, email, ruolo } = req.body;
    if (!username || !email) {
        res.status(400).json({ errore: { codice: 'CAMPI_OBBLIGATORI_MANCANTI', messaggio: 'Campi obbligatori mancanti: username, email' } });
        return;
    }
    try {
        const nuovoUtente = await this.userService.creaUtente({ username, email, ruolo });
        res.status(201).json(nuovoUtente);
    } catch (errore) {
        if (errore instanceof Error && errore.message === 'EMAIL_GIA_IN_USO') {
        res.status(409).json({ errore: { codice: 'EMAIL_GIA_IN_USO', messaggio: 'Questa email è già registrata' } });
        return;
        }
        console.error('Errore durante la creazione dell\'utente:', errore);
        res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante la creazione dell\'utente' } });
    }
  };
}