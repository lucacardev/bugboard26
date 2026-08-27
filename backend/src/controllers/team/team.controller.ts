// controllers/team/team.controller.ts

import { Request, Response } from 'express';
import { TeamService } from '../../services/team/team.service';

export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  getTeam = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const team = await this.teamService.getTeam(id);
      res.status(200).json(team);
    } catch (errore) {
      if (errore instanceof Error && errore.message === 'TEAM_NON_TROVATO') {
        res.status(404).json({ errore: { codice: 'TEAM_NON_TROVATO', messaggio: 'Nessun team trovato con questo id' } });
        return;
      }
      console.error('Errore durante il recupero del team:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante il recupero del team' } });
    }
  };

  cambiaNome = async (req: Request, res: Response): Promise<void> => {
    const { nome } = req.body;
    if (!nome) {
      res.status(400).json({ errore: { codice: 'CAMPO_MANCANTE', messaggio: 'Campo obbligatorio mancante: nome' } });
      return;
    }
    try {
      const id = Number(req.params.id);
      const team = await this.teamService.cambiaNome(id, nome);
      res.status(200).json(team);
    } catch (errore) {
      if (errore instanceof Error && errore.message === 'TEAM_NON_TROVATO') {
        res.status(404).json({ errore: { codice: 'TEAM_NON_TROVATO', messaggio: 'Nessun team trovato con questo id' } });
        return;
      }
      console.error('Errore durante la modifica del team:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante la modifica del team' } });
    }
  };

  getMembri = async (req: Request, res: Response): Promise<void> => {
    try {
      const teamId = Number(req.params.id);
      const membri = await this.teamService.getMembri(teamId);
      res.status(200).json(membri);
    } catch (errore) {
      if (errore instanceof Error && errore.message === 'TEAM_NON_TROVATO') {
        res.status(404).json({ errore: { codice: 'TEAM_NON_TROVATO', messaggio: 'Nessun team trovato con questo id' } });
        return;
      }
      console.error('Errore durante il recupero dei membri:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante il recupero dei membri' } });
    }
  };

  aggiungiMembro = async (req: Request, res: Response): Promise<void> => {
    const { utenteId } = req.body;
    if (!utenteId) {
      res.status(400).json({ errore: { codice: 'CAMPO_MANCANTE', messaggio: 'Campo obbligatorio mancante: utenteId' } });
      return;
    }
    try {
      const teamId = Number(req.params.id);
      await this.teamService.aggiungiMembro(teamId, utenteId);
      res.status(201).json({ messaggio: 'Membro aggiunto correttamente' });
    } catch (errore) {
      if (errore instanceof Error && errore.message === 'TEAM_NON_TROVATO') {
        res.status(404).json({ errore: { codice: 'TEAM_NON_TROVATO', messaggio: 'Nessun team trovato con questo id' } });
        return;
      }
      if (errore instanceof Error && errore.message === 'UTENTE_GIA_MEMBRO') {
        res.status(409).json({ errore: { codice: 'UTENTE_GIA_MEMBRO', messaggio: 'L\'utente è già membro di questo team' } });
        return;
      }
      console.error('Errore durante l\'aggiunta del membro:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante l\'aggiunta del membro' } });
    }
  };

  rimuoviMembro = async (req: Request, res: Response): Promise<void> => {
    try {
      const teamId = Number(req.params.id);
      const utenteId = Number(req.params.utenteId);
      await this.teamService.rimuoviMembro(teamId, utenteId);
      res.status(204).send();
    } catch (errore) {
      if (errore instanceof Error && errore.message === 'TEAM_NON_TROVATO') {
        res.status(404).json({ errore: { codice: 'TEAM_NON_TROVATO', messaggio: 'Nessun team trovato con questo id' } });
        return;
      }
      console.error('Errore durante la rimozione del membro:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante la rimozione del membro' } });
    }
  };
}