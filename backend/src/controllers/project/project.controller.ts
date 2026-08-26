// controllers/project/project.controller.ts

import { Request, Response } from 'express';
import { ProgettoService } from '../../services/project/project.service';

export class ProgettoController {
  constructor(private progettoService: ProgettoService) {}

  creaProgetto = async (req: Request, res: Response): Promise<void> => {
    const { nome, descrizione, nomeTeam } = req.body;

    if (!nome || !nomeTeam) {
        res.status(400).json({
        errore: { codice: 'CAMPI_OBBLIGATORI_MANCANTI', messaggio: 'Campi obbligatori mancanti: nome, nomeTeam' },
        });
        return;
    }

    try {
        const nuovoProgetto = await this.progettoService.creaProgetto({
        nome,
        descrizione,
        creatoDa: req.utente!.id,
        nomeTeam,
        });
        res.status(201).json(nuovoProgetto);
    } catch (errore) {
        console.error('Errore durante la creazione del progetto:', errore);
        res.status(500).json({
        errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante la creazione del progetto' },
        });
    }
  };

  getProgetto = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const progetto = await this.progettoService.getProgetto(id);
      res.status(200).json(progetto);
    } catch (errore) {
      if (errore instanceof Error && errore.message === 'PROGETTO_NON_TROVATO') {
        res.status(404).json({
          errore: { codice: 'PROGETTO_NON_TROVATO', messaggio: 'Nessun progetto trovato con questo id' },
        });
        return;
      }
      console.error('Errore durante il recupero del progetto:', errore);
      res.status(500).json({
        errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante il recupero del progetto' },
      });
    }
  };

  getProgettiUtente = async (req: Request, res: Response): Promise<void> => {
    try {
      const utenteId = Number(req.params.utenteId);
      const progetti = await this.progettoService.getProgettiUtente(utenteId);
      res.status(200).json(progetti);
    } catch (errore) {
      console.error('Errore durante il recupero dei progetti:', errore);
      res.status(500).json({
        errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante il recupero dei progetti' },
      });
    }
  };

  modificaNome = async (req: Request, res: Response): Promise<void> => {
    const { nome } = req.body;

    if (!nome) {
      res.status(400).json({
        errore: { codice: 'CAMPO_MANCANTE', messaggio: 'Campo obbligatorio mancante: nome' },
      });
      return;
    }

    try {
      const id = Number(req.params.id);
      const progetto = await this.progettoService.modificaNome(id, nome);
      res.status(200).json(progetto);
    } catch (errore) {
      if (errore instanceof Error && errore.message === 'PROGETTO_NON_TROVATO') {
        res.status(404).json({
          errore: { codice: 'PROGETTO_NON_TROVATO', messaggio: 'Nessun progetto trovato con questo id' },
        });
        return;
      }
      console.error('Errore durante la modifica del progetto:', errore);
      res.status(500).json({
        errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante la modifica del progetto' },
      });
    }
  };

  modificaDescrizione = async (req: Request, res: Response): Promise<void> => {
    const { descrizione } = req.body;

    try {
      const id = Number(req.params.id);
      const progetto = await this.progettoService.modificaDescrizione(id, descrizione ?? null);
      res.status(200).json(progetto);
    } catch (errore) {
      if (errore instanceof Error && errore.message === 'PROGETTO_NON_TROVATO') {
        res.status(404).json({
          errore: { codice: 'PROGETTO_NON_TROVATO', messaggio: 'Nessun progetto trovato con questo id' },
        });
        return;
      }
      console.error('Errore durante la modifica del progetto:', errore);
      res.status(500).json({
        errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante la modifica del progetto' },
      });
    }
  };
}