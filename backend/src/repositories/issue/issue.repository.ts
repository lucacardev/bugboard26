import { Issue, TipoIssue, StatoIssue } from '../../models/Issue';
import { Progetto } from '../../models/Progetto';

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
   * Punto 4 traccia: "Gli utenti possono visualizzare i bug loro assegnati",
   * senza vincolo di progetto — vista cross-progetto, a differenza di
   * findByProgetto. Include il nome del progetto di ciascuna issue, altrimenti
   * la lista sarebbe poco utile senza sapere a quale progetto appartiene.
   */
  async findByAssegnatario(utenteId: number): Promise<Issue[]> {
    return Issue.findAll({
      where: { assegnatarioId: utenteId },
      include: [{ model: Progetto, as: 'progetto', attributes: ['id', 'nome'] }],
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Salva su database una nuova istanza di Issue (già costruita,
   * ma non ancora persistita).
   */
  async save(issue: Issue): Promise<Issue> {
    return issue.save();
  }
}