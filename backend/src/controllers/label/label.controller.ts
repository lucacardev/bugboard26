// controllers/label/label.controller.ts

import { Request, Response } from 'express';
import { LabelService } from '../../services/label/label.service';

export class LabelController {
  constructor(private labelService: LabelService) {}

    creaEtichetta = async (req: Request, res: Response): Promise<void> => {
    // TODO(autorizzazione): punto 10 traccia — solo un membro del team del
    // progetto (progettoId nel body) può creare etichette, non un utente
    // qualsiasi. Controllo da aggiungere qui una volta integrato Cognito:
    // verificare che req.utente sia membro del Team associato a progettoId
    // (query verso TeamRepository/UserRepository per il match).
    const { testo, colore, progettoId } = req.body;
    if (!testo || !colore || !progettoId) {
        res.status(400).json({ errore: { codice: 'CAMPI_OBBLIGATORI_MANCANTI', messaggio: 'Campi obbligatori mancanti: testo, colore, progettoId' } });
        return;
    }
    try {
        const nuovaEtichetta = await this.labelService.creaEtichetta({ testo, colore, progettoId });
        res.status(201).json(nuovaEtichetta);
    } catch (errore) {
        if (errore instanceof Error && errore.message === 'ETICHETTA_GIA_ESISTENTE') {
        res.status(409).json({ errore: { codice: 'ETICHETTA_GIA_ESISTENTE', messaggio: 'Un\'etichetta con questo testo esiste già in questo progetto' } });
        return;
        }
        console.error('Errore durante la creazione dell\'etichetta:', errore);
        res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante la creazione dell\'etichetta' } });
    }
    };

  getEtichetteProgetto = async (req: Request, res: Response): Promise<void> => {
    try {
      const progettoId = Number(req.params.progettoId);
      const etichette = await this.labelService.getEtichetteProgetto(progettoId);
      res.status(200).json(etichette);
    } catch (errore) {
      console.error('Errore durante il recupero delle etichette:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante il recupero delle etichette' } });
    }
  };

  modificaColore = async (req: Request, res: Response): Promise<void> => {
    const { colore } = req.body;
    if (!colore) {
      res.status(400).json({ errore: { codice: 'CAMPO_MANCANTE', messaggio: 'Campo obbligatorio mancante: colore' } });
      return;
    }
    try {
      const id = Number(req.params.id);
      const etichetta = await this.labelService.modificaColore(id, colore);
      res.status(200).json(etichetta);
    } catch (errore) {
      if (errore instanceof Error && errore.message === 'ETICHETTA_NON_TROVATA') {
        res.status(404).json({ errore: { codice: 'ETICHETTA_NON_TROVATA', messaggio: 'Nessuna etichetta trovata con questo id' } });
        return;
      }
      console.error('Errore durante la modifica dell\'etichetta:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante la modifica dell\'etichetta' } });
    }
  };

  getEtichetteIssue = async (req: Request, res: Response): Promise<void> => {
    try {
      const issueId = Number(req.params.issueId);
      const etichette = await this.labelService.getEtichetteIssue(issueId);
      res.status(200).json(etichette);
    } catch (errore) {
      console.error('Errore durante il recupero delle etichette:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante il recupero delle etichette' } });
    }
  };

  associaAIssue = async (req: Request, res: Response): Promise<void> => {
    const { etichettaId } = req.body;
    if (!etichettaId) {
      res.status(400).json({ errore: { codice: 'CAMPO_MANCANTE', messaggio: 'Campo obbligatorio mancante: etichettaId' } });
      return;
    }
    try {
      const issueId = Number(req.params.issueId);
      await this.labelService.associaAIssue(issueId, etichettaId);
      res.status(201).json({ messaggio: 'Etichetta associata correttamente' });
    } catch (errore) {
      if (errore instanceof Error && errore.message === 'ETICHETTA_NON_TROVATA') {
        res.status(404).json({ errore: { codice: 'ETICHETTA_NON_TROVATA', messaggio: 'Nessuna etichetta trovata con questo id' } });
        return;
      }
      if (errore instanceof Error && errore.message === 'ETICHETTA_GIA_ASSOCIATA') {
        res.status(409).json({ errore: { codice: 'ETICHETTA_GIA_ASSOCIATA', messaggio: 'Questa etichetta è già associata a questa issue' } });
        return;
      }
      console.error('Errore durante l\'associazione dell\'etichetta:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante l\'associazione dell\'etichetta' } });
    }
  };

  rimuoviDaIssue = async (req: Request, res: Response): Promise<void> => {
    try {
      const issueId = Number(req.params.issueId);
      const etichettaId = Number(req.params.etichettaId);
      await this.labelService.rimuoviDaIssue(issueId, etichettaId);
      res.status(204).send();
    } catch (errore) {
      console.error('Errore durante la rimozione dell\'etichetta:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante la rimozione dell\'etichetta' } });
    }
  };
}