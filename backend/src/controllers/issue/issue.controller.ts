import { Request, Response } from 'express';
import { IssueService } from '../../services/issue/issue.service';
import { TipoIssue } from '../../models/Issue';

export class IssueController {
  constructor(private issueService: IssueService) {}

  segnalaIssue = async (req: Request, res: Response): Promise<void> => {
    const { tipo, titolo, descrizione, priorita, dataInizio, dataScadenza, progettoId, segnalatoreId, assegnatarioId } = req.body;

    if (!tipo || !titolo || !progettoId || !segnalatoreId) {
      res.status(400).json({
        errore: {
          codice: 'CAMPI_OBBLIGATORI_MANCANTI',
          messaggio: 'Campi obbligatori mancanti: tipo, titolo, progettoId, segnalatoreId',
        },
      });
      return;
    }

    try {
      const nuovaIssue = await this.issueService.segnalaIssue(tipo as TipoIssue, {
        titolo,
        descrizione,
        priorita,
        dataInizio,
        dataScadenza,
        progettoId,
        segnalatoreId,
        assegnatarioId,
      });
      res.status(201).json(nuovaIssue);
    } catch (errore) {
      console.error('Errore durante la creazione della issue:', errore);
      res.status(500).json({
        errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante la creazione della issue' },
      });
    }
  };

  getIssue = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const issue = await this.issueService.getIssue(id);
      res.status(200).json(issue);
    } catch (errore) {
      if (errore instanceof Error && errore.message === 'ISSUE_NON_TROVATA') {
        res.status(404).json({
          errore: { codice: 'ISSUE_NON_TROVATA', messaggio: 'Nessuna issue trovata con questo id' },
        });
        return;
      }
      console.error('Errore durante il recupero della issue:', errore);
      res.status(500).json({
        errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante il recupero della issue' },
      });
    }
  };

  visualizzaIssueProgetto = async (req: Request, res: Response): Promise<void> => {
    try {
      const progettoId = Number(req.params.progettoId);
      const { tipo, stato, assegnatarioId } = req.query;

      const issues = await this.issueService.visualizzaIssueProgetto(progettoId, {
        tipo: tipo as TipoIssue | undefined,
        stato: stato as any,
        assegnatarioId: assegnatarioId ? Number(assegnatarioId) : undefined,
      });

      res.status(200).json(issues);
    } catch (errore) {
      console.error('Errore durante il recupero delle issue:', errore);
      res.status(500).json({
        errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante il recupero delle issue' },
      });
    }
  };
}