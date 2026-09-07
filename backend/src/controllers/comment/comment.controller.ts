// controllers/comment/comment.controller.ts

import { Request, Response } from 'express';
import { CommentoService } from '../../services/comment/comment.service';

export class CommentoController {
  constructor(private readonly commentoService: CommentoService) {}

  scriviCommento = async (req: Request, res: Response): Promise<void> => {
    const { testo, issueId } = req.body;
    if (!testo || !issueId) {
      res.status(400).json({
        errore: { codice: 'CAMPI_OBBLIGATORI_MANCANTI', messaggio: 'Campi obbligatori mancanti: testo, issueId' },
      });
      return;
    }
    try {
      const commento = await this.commentoService.scriviCommento({ testo, issueId, autoreId: req.utente!.id });
      res.status(201).json(commento);
    } catch (errore) {
      console.error('Errore durante la scrittura del commento:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante la scrittura del commento' } });
    }
  };

  getCommentiIssue = async (req: Request, res: Response): Promise<void> => {
    try {
      const issueId = Number(req.params.issueId);
      const commenti = await this.commentoService.getCommentiIssue(issueId);
      res.status(200).json(commenti);
    } catch (errore) {
      console.error('Errore durante il recupero dei commenti:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante il recupero dei commenti' } });
    }
  };

  modificaTesto = async (req: Request, res: Response): Promise<void> => {
    const { testo } = req.body;
    if (!testo) {
      res.status(400).json({ errore: { codice: 'CAMPI_OBBLIGATORI_MANCANTI', messaggio: 'Campo obbligatorio mancante: testo' } });
      return;
    }
    try {
      const id = Number(req.params.id);

      // Controllo di autorizzazione: solo l'autore può modificare il proprio commento.
      // Richiede una lettura preliminare per conoscere l'autore reale della riga.
      const commentoEsistente = await this.commentoService.getCommento(id);
      if (commentoEsistente.autoreId !== req.utente!.id) {
        res.status(403).json({ errore: { codice: 'NON_AUTORIZZATO', messaggio: 'Non sei l\'autore di questo commento' } });
        return;
      }

      const commentoAggiornato = await this.commentoService.modificaTesto(id, testo);
      res.status(200).json(commentoAggiornato);
    } catch (errore) {
      if (errore instanceof Error && errore.message === 'COMMENTO_NON_TROVATO') {
        res.status(404).json({ errore: { codice: 'COMMENTO_NON_TROVATO', messaggio: 'Nessun commento trovato con questo id' } });
        return;
      }
      console.error('Errore durante la modifica del commento:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante la modifica del commento' } });
    }
  };
}