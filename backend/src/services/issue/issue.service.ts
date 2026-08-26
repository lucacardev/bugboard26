import { Issue, TipoIssue, StatoIssue } from '../../models/Issue';
import { IssueFactory, DatiCreazioneIssue } from './issue.factory';
import { IssueRepository, FiltriIssue } from '../../repositories/issue/issue.repository';

export class IssueService {
  constructor(private issueRepository: IssueRepository) {}

  async segnalaIssue(tipo: TipoIssue, dati: DatiCreazioneIssue): Promise<Issue> {
    const nuovaIssue = IssueFactory.creaIssue(tipo, dati);
    return this.issueRepository.save(nuovaIssue);
  }

  async visualizzaIssueProgetto(progettoId: number, filtri?: FiltriIssue): Promise<Issue[]> {
    return this.issueRepository.findByProgetto(progettoId, filtri);
  }

  async getIssue(id: number): Promise<Issue> {
    const issue = await this.issueRepository.findById(id);
    if (!issue) {
      throw new Error('ISSUE_NON_TROVATA');
    }
    return issue;
  }

  /** Punto 6/9 traccia: il metodo di dominio esisteva già su Issue, mancava solo l'orchestrazione. */
  async cambiaStato(id: number, nuovoStato: StatoIssue): Promise<Issue> {
    const issue = await this.getIssue(id);
    issue.cambiaStato(nuovoStato);
    return this.issueRepository.save(issue);
  }

  /** Punto 4 traccia: assegnazione, riservata all'Amministratore (autorizzazione nel Controller). */
  async assegnaA(id: number, utenteId: number): Promise<Issue> {
    const issue = await this.getIssue(id);
    issue.assegnaA(utenteId);
    return this.issueRepository.save(issue);
  }
}