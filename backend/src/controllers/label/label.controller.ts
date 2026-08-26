// controllers/label/label.controller.ts

import { Request, Response } from 'express';
import { LabelService } from '../../services/label/label.service';
import { TeamRepository } from '../../repositories/team/team.repository';

export class LabelController {
  constructor(private labelService: LabelService, private teamRepository: TeamRepository) {}

  creaEtichetta = async (req: Request, res: Response): Promise<void> => {
    const { testo, colore, progettoId } = req.body;
    if (!testo || !colore || !progettoId) {
      res.status(400).json({ errore: { codice: 'CAMPI_OBBLIGATORI_MANCANTI', messaggio: 'Campi obbligatori mancanti: testo, colore, progettoId' } });
      return;
    }
    try {
      // Punto 10 traccia: creabile da qualunque Membro team del progetto
      // (l'Amministratore ha comunque accesso completo).
      if (req.utente!.ruolo !== 'amministratore') {
        const team = await this.teamRepository.findByProgettoId(Number(progettoId));
        const membro = team ? await this.teamRepository.isMembro(team.id, req.utente!.id) : false;
        if (!membro) {
          res.status(403).json({ errore: { codice: 'NON_AUTORIZZATO', messaggio: 'Solo un membro del team di questo progetto può creare etichette' } });
          return;
        }
      }

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