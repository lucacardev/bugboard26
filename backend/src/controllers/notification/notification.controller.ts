// controllers/notification/notification.controller.ts

import { Request, Response } from 'express';
import { NotificationService } from '../../services/notification/notification.service';

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  getNotificheUtente = async (req: Request, res: Response): Promise<void> => {
    try {
      const notifiche = await this.notificationService.getNotificheUtente(req.utente!.id);
      res.status(200).json(notifiche);
    } catch (errore) {
      console.error('Errore durante il recupero delle notifiche:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante il recupero delle notifiche' } });
    }
  };

  segnaComeLetta = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const notifica = await this.notificationService.segnaComeLetta(id, req.utente!.id);
      res.status(200).json(notifica);
    } catch (errore) {
      if (errore instanceof Error && errore.message === 'NOTIFICA_NON_TROVATA') {
        res.status(404).json({ errore: { codice: 'NOTIFICA_NON_TROVATA', messaggio: 'Nessuna notifica trovata con questo id' } });
        return;
      }
      if (errore instanceof Error && errore.message === 'NON_AUTORIZZATO') {
        res.status(403).json({ errore: { codice: 'NON_AUTORIZZATO', messaggio: 'Questa notifica non ti appartiene' } });
        return;
      }
      console.error('Errore durante l\'aggiornamento della notifica:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante l\'aggiornamento della notifica' } });
    }
  };
}