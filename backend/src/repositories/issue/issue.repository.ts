import { Issue, TipoIssue, StatoIssue } from '../../models/Issue';

export interface FiltriIssue {
  tipo?: TipoIssue;
  stato?: StatoIssue;
  assegnatarioId?: number;
}

export class IssueRepository {
  /**
   * Cerca una issue tramite il suo id.
   */
  async findById(id: number): Promise<Issue | null> {
    return Issue.findByPk(id);
  }

  /**
   * Restituisce le issue di un progetto, applicando opzionalmente
   * i filtri richiesti (tipo, stato, assegnatario). I filtri non
   * specificati vengono semplicemente omessi dalla query.
   */
  async findByProgetto(progettoId: number, filtri: FiltriIssue = {}): Promise<Issue[]> {
    const condizioni: Record<string, unknown> = { progettoId };

    if (filtri.tipo) condizioni.tipo = filtri.tipo;
    if (filtri.stato) condizioni.stato = filtri.stato;
    if (filtri.assegnatarioId) condizioni.assegnatarioId = filtri.assegnatarioId;

    return Issue.findAll({ where: condizioni });
  }

  /**
   * Salva su database una nuova istanza di Issue (già costruita,
   * ma non ancora persistita).
   */
  async save(issue: Issue): Promise<Issue> {
    return issue.save();
  }
}