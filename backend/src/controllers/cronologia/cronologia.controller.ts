// controllers/cronologia/cronologia.controller.ts

import { Request, Response } from 'express';
import { CronologiaService } from '../../services/cronologia/cronologia.service';
import { IssueRepository } from '../../repositories/issue/issue.repository';
import { TeamRepository } from '../../repositories/team/team.repository';

export class CronologiaController {
  constructor(
    private readonly cronologiaService: CronologiaService,
    private readonly issueRepository: IssueRepository,
    private readonly teamRepository: TeamRepository
  ) {}

  /** Decisione già presa: "Visualizzare cronologia issue" → Membro team (non Utente autenticato generico). */
  getCronologiaIssue = async (req: Request, res: Response): Promise<void> => {
    try {
      const issueId = Number(req.params.issueId);
      const issue = await this.issueRepository.findById(issueId);
      if (!issue) {
        res.status(404).json({ errore: { codice: 'ISSUE_NON_TROVATA', messaggio: 'Nessuna issue trovata con questo id' } });
        return;
      }

      if (req.utente!.ruolo !== 'amministratore') {
        const team = await this.teamRepository.findByProgettoId(issue.progettoId);
        const membro = team ? await this.teamRepository.isMembro(team.id, req.utente!.id) : false;
        if (!membro) {
          res.status(403).json({ errore: { codice: 'NON_AUTORIZZATO', messaggio: 'Solo un membro del team di questo progetto può visualizzare la cronologia' } });
          return;
        }
      }

      const cronologia = await this.cronologiaService.getCronologiaIssue(issueId);
      res.status(200).json(cronologia);
    } catch (errore) {
      console.error('Errore durante il recupero della cronologia:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante il recupero della cronologia' } });
    }
  };
}