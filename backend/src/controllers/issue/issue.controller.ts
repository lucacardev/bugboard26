import { Request, Response } from 'express';
import { IssueService } from '../../services/issue/issue.service';
import { TipoIssue, StatoIssue } from '../../models/Issue';

export class IssueController {
  constructor(private issueService: IssueService) {}

  segnalaIssue = async (req: Request, res: Response): Promise<void> => {
    const { tipo, titolo, descrizione, priorita, dataInizio, dataScadenza, progettoId, assegnatarioId } = req.body;

    if (!tipo || !titolo || !progettoId) {
      res.status(400).json({
        errore: { codice: 'CAMPI_OBBLIGATORI_MANCANTI', messaggio: 'Campi obbligatori mancanti: tipo, titolo, progettoId' },
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
        segnalatoreId: req.utente!.id,
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
        res.status(404).json({ errore: { codice: 'ISSUE_NON_TROVATA', messaggio: 'Nessuna issue trovata con questo id' } });
        return;
      }
      console.error('Errore durante il recupero della issue:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante il recupero della issue' } });
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
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante il recupero delle issue' } });
    }
  };

  /**
   * Punto 6/9 traccia: l'Amministratore ha accesso completo; l'assegnatario
   * può cambiare SOLO lo stato delle issue a lui assegnate (non titolo/descrizione,
   * interpretazione già consolidata). Richiede una lettura preliminare per
   * conoscere l'assegnatario reale prima di autorizzare la scrittura.
   */
  cambiaStato = async (req: Request, res: Response): Promise<void> => {
    const { stato } = req.body;
    if (!stato) {
      res.status(400).json({ errore: { codice: 'CAMPI_OBBLIGATORI_MANCANTI', messaggio: 'Campo obbligatorio mancante: stato' } });
      return;
    }
    try {
      const id = Number(req.params.id);
      const issueEsistente = await this.issueService.getIssue(id);

      const autorizzato = req.utente!.ruolo === 'amministratore' || issueEsistente.assegnatarioId === req.utente!.id;
      if (!autorizzato) {
        res.status(403).json({ errore: { codice: 'NON_AUTORIZZATO', messaggio: 'Non sei l\'assegnatario di questa issue' } });
        return;
      }

      const issueAggiornata = await this.issueService.cambiaStato(id, stato as StatoIssue);
      res.status(200).json(issueAggiornata);
    } catch (errore) {
      if (errore instanceof Error && errore.message === 'ISSUE_NON_TROVATA') {
        res.status(404).json({ errore: { codice: 'ISSUE_NON_TROVATA', messaggio: 'Nessuna issue trovata con questo id' } });
        return;
      }
      console.error('Errore durante il cambio di stato della issue:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante il cambio di stato della issue' } });
    }
  };

  /** Punto 4 traccia: assegnazione riservata all'Amministratore (soloAmministratore in route). */
  assegnaIssue = async (req: Request, res: Response): Promise<void> => {
    const { assegnatarioId } = req.body;
    if (!assegnatarioId) {
      res.status(400).json({ errore: { codice: 'CAMPI_OBBLIGATORI_MANCANTI', messaggio: 'Campo obbligatorio mancante: assegnatarioId' } });
      return;
    }
    try {
      const id = Number(req.params.id);
      const issueAggiornata = await this.issueService.assegnaA(id, Number(assegnatarioId));
      res.status(200).json(issueAggiornata);
    } catch (errore) {
      if (errore instanceof Error && errore.message === 'ISSUE_NON_TROVATA') {
        res.status(404).json({ errore: { codice: 'ISSUE_NON_TROVATA', messaggio: 'Nessuna issue trovata con questo id' } });
        return;
      }
      console.error('Errore durante l\'assegnazione della issue:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante l\'assegnazione della issue' } });
    }
  };
}