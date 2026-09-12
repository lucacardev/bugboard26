import { Request, Response } from 'express';
import { IssueService } from '../../services/issue/issue.service';
import { TipoIssue, StatoIssue } from '../../models/Issue';

const TIPI_ISSUE_CONSENTITI: TipoIssue[] = ['bug', 'question', 'documentation', 'feature'];
const STATI_ISSUE_CONSENTITI: StatoIssue[] = ['todo', 'in_progress', 'done'];

export class IssueController {
  constructor(private readonly issueService: IssueService) {}

  segnalaIssue = async (req: Request, res: Response): Promise<void> => {
    const { tipo, titolo, descrizione, priorita, dataInizio, dataScadenza, progettoId, assegnatarioId } = req.body;

    if (
      typeof tipo !== 'string' ||
      typeof titolo !== 'string' ||
      !titolo.trim() ||
      typeof descrizione !== 'string' ||
      !descrizione.trim() ||
      typeof progettoId !== 'number' ||
      !Number.isInteger(progettoId) ||
      progettoId <= 0
    ) {
      res.status(400).json({
        errore: {
          codice: 'CAMPI_OBBLIGATORI_MANCANTI',
          messaggio: 'Campi obbligatori non validi o mancanti: tipo, titolo, descrizione, progettoId',
        },
      });
      return;
    }

    if (!TIPI_ISSUE_CONSENTITI.includes(tipo as TipoIssue)) {
      res.status(400).json({
        errore: {
          codice: 'TIPO_ISSUE_NON_VALIDO',
          messaggio: 'Tipo issue non valido: usare bug, question, documentation oppure feature',
        },
      });
      return;
    }

    // L'assegnazione contestuale alla creazione è riservata
    // all'amministratore. Un valore inviato da un non-admin viene ignorato:
    // non ci si affida alla sola visibilità del campo nel frontend.
    const assegnatarioIdSicuro = req.utente!.ruolo === 'amministratore' ? assegnatarioId : undefined;

    if (
      assegnatarioIdSicuro !== undefined &&
      (typeof assegnatarioIdSicuro !== 'number' ||
        !Number.isInteger(assegnatarioIdSicuro) ||
        assegnatarioIdSicuro <= 0)
    ) {
      res.status(400).json({
        errore: {
          codice: 'ASSEGNATARIO_NON_VALIDO',
          messaggio: 'assegnatarioId deve essere un numero intero positivo',
        },
      });
      return;
    }

    try {
      const nuovaIssue = await this.issueService.segnalaIssue(tipo as TipoIssue, {
        titolo: titolo.trim(),
        descrizione: descrizione.trim(),
        priorita,
        dataInizio,
        dataScadenza,
        progettoId,
        segnalatoreId: req.utente!.id,
        assegnatarioId: assegnatarioIdSicuro,
      });

      res.status(201).json(nuovaIssue);
    } catch (errore) {
      if (errore instanceof Error && errore.message === 'ASSEGNATARIO_NON_MEMBRO') {
        res.status(400).json({
          errore: {
            codice: 'ASSEGNATARIO_NON_MEMBRO',
            messaggio: 'L\'utente indicato non è membro del team di questo progetto',
          },
        });
        return;
      }

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
        stato: stato as StatoIssue | undefined,
        assegnatarioId: assegnatarioId ? Number(assegnatarioId) : undefined,
      });

      res.status(200).json(issues);
    } catch (errore) {
      console.error('Errore durante il recupero delle issue:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante il recupero delle issue' } });
    }
  };

  /** Punto 4 traccia: le issue assegnate all'utente corrente, indipendentemente dal progetto. */
  getIssueAssegnateAMe = async (req: Request, res: Response): Promise<void> => {
    try {
      const issues = await this.issueService.getIssueAssegnateA(req.utente!.id);
      res.status(200).json(issues);
    } catch (errore) {
      console.error('Errore durante il recupero delle issue assegnate:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante il recupero delle issue assegnate' } });
    }
  };

  /**
   * Punto 6/9 traccia: l'Amministratore ha accesso completo; l'assegnatario
   * può cambiare SOLO lo stato delle issue a lui assegnate.
   */
  cambiaStato = async (req: Request, res: Response): Promise<void> => {
    const { stato } = req.body;

    if (typeof stato !== 'string' || !STATI_ISSUE_CONSENTITI.includes(stato as StatoIssue)) {
      res.status(400).json({
        errore: {
          codice: 'STATO_NON_VALIDO',
          messaggio: 'Stato non valido: usare todo, in_progress oppure done',
        },
      });
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

      const issueAggiornata = await this.issueService.cambiaStato(id, stato as StatoIssue, req.utente!.id);
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

    if (assegnatarioId === undefined) {
      res.status(400).json({ errore: { codice: 'CAMPI_OBBLIGATORI_MANCANTI', messaggio: 'Campo obbligatorio mancante: assegnatarioId' } });
      return;
    }

    if (
      assegnatarioId !== null &&
      (typeof assegnatarioId !== 'number' || !Number.isInteger(assegnatarioId) || assegnatarioId <= 0)
    ) {
      res.status(400).json({
        errore: {
          codice: 'ASSEGNATARIO_NON_VALIDO',
          messaggio: 'assegnatarioId deve essere un numero intero positivo oppure null',
        },
      });
      return;
    }

    try {
      const id = Number(req.params.id);
      const issueAggiornata = await this.issueService.assegnaA(id, assegnatarioId, req.utente!.id);
      res.status(200).json(issueAggiornata);
    } catch (errore) {
      if (errore instanceof Error && errore.message === 'ISSUE_NON_TROVATA') {
        res.status(404).json({ errore: { codice: 'ISSUE_NON_TROVATA', messaggio: 'Nessuna issue trovata con questo id' } });
        return;
      }
      if (errore instanceof Error && errore.message === 'ASSEGNATARIO_NON_MEMBRO') {
        res.status(400).json({
          errore: {
            codice: 'ASSEGNATARIO_NON_MEMBRO',
            messaggio: 'L\'utente indicato non è membro del team di questo progetto',
          },
        });
        return;
      }
      console.error('Errore durante l\'assegnazione della issue:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante l\'assegnazione della issue' } });
    }
  };

  /**
   * La priorità è un campo di pianificazione/triage: la sua modifica dopo
   * la creazione è riservata all'Amministratore.
   */
  cambiaPriorita = async (req: Request, res: Response): Promise<void> => {
    const { priorita } = req.body;
    const valoriAmmessi = ['bassa', 'media', 'alta', null];

    if (priorita !== undefined && !valoriAmmessi.includes(priorita)) {
      res.status(400).json({ errore: { codice: 'PRIORITA_NON_VALIDA', messaggio: 'Priorità non valida: usare bassa, media, alta oppure null' } });
      return;
    }

    try {
      const id = Number(req.params.id);

      if (req.utente!.ruolo !== 'amministratore') {
        res.status(403).json({ errore: { codice: 'NON_AUTORIZZATO', messaggio: 'Solo un amministratore può modificare la priorità' } });
        return;
      }

      const issueAggiornata = await this.issueService.cambiaPriorita(id, priorita ?? null, req.utente!.id);
      res.status(200).json(issueAggiornata);
    } catch (errore) {
      if (errore instanceof Error && errore.message === 'ISSUE_NON_TROVATA') {
        res.status(404).json({ errore: { codice: 'ISSUE_NON_TROVATA', messaggio: 'Nessuna issue trovata con questo id' } });
        return;
      }
      console.error('Errore durante il cambio di priorità della issue:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante il cambio di priorità della issue' } });
    }
  };

  /** Punto 18 traccia: le date opzionali sono modificabili dall'Amministratore. */
  cambiaDate = async (req: Request, res: Response): Promise<void> => {
    const { dataInizio, dataScadenza } = req.body;

    try {
      const id = Number(req.params.id);

      const issueAggiornata = await this.issueService.cambiaDate(
        id,
        dataInizio ? new Date(dataInizio) : null,
        dataScadenza ? new Date(dataScadenza) : null,
        req.utente!.id
      );

      res.status(200).json(issueAggiornata);
    } catch (errore) {
      if (errore instanceof Error && errore.message === 'ISSUE_NON_TROVATA') {
        res.status(404).json({ errore: { codice: 'ISSUE_NON_TROVATA', messaggio: 'Nessuna issue trovata con questo id' } });
        return;
      }
      console.error('Errore durante il cambio di date della issue:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante il cambio di date della issue' } });
    }
  };
}
