// services/issue/issue.service.ts

import { Issue, TipoIssue, StatoIssue } from '../../models/Issue';
import { IssueFactory, DatiCreazioneIssue } from './issue.factory';
import { IssueRepository, FiltriIssue } from '../../repositories/issue/issue.repository';
import { ObserverCronologia } from '../cronologia/observer-cronologia.interface';

/**
 * Subject del pattern Observer (Lecture 19A). attach/detach/notifica stanno
 * qui e non sul model Issue: IssueService è l'istanza a vita lunga (creata
 * una sola volta in issue.routes.ts, riusata per ogni richiesta), mentre
 * ogni istanza di Issue viene ricaricata da zero ad ogni richiesta HTTP e
 * non potrebbe mantenere un registro di Observer persistente tra una
 * richiesta e l'altra.
 */
export class IssueService {
  private observers: ObserverCronologia[] = [];

  constructor(private issueRepository: IssueRepository) {}

  attach(observer: ObserverCronologia): void {
    this.observers.push(observer);
  }

  detach(observer: ObserverCronologia): void {
    this.observers = this.observers.filter((o) => o !== observer);
  }

  private async notifica(issue: Issue, descrizione: string, autoreId: number): Promise<void> {
    for (const observer of this.observers) {
      await observer.aggiorna(issue, descrizione, autoreId);
    }
  }

  async segnalaIssue(tipo: TipoIssue, dati: DatiCreazioneIssue): Promise<Issue> {
    const nuovaIssue = IssueFactory.creaIssue(tipo, dati);
    const issueSalvata = await this.issueRepository.save(nuovaIssue);
    // Vincolo già annotato in associations.ts: min 1 VoceCronologia per Issue, gestito qui.
    await this.notifica(issueSalvata, 'Issue creata', dati.segnalatoreId);
    return issueSalvata;
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

  async cambiaStato(id: number, nuovoStato: StatoIssue, autoreId: number): Promise<Issue> {
    const issue = await this.getIssue(id);
    const statoPrecedente = issue.stato;
    issue.cambiaStato(nuovoStato);
    const issueSalvata = await this.issueRepository.save(issue);
    await this.notifica(issueSalvata, `Stato cambiato da "${statoPrecedente}" a "${nuovoStato}"`, autoreId);
    return issueSalvata;
  }

  async assegnaA(id: number, utenteId: number, autoreId: number): Promise<Issue> {
    const issue = await this.getIssue(id);
    issue.assegnaA(utenteId);
    const issueSalvata = await this.issueRepository.save(issue);
    await this.notifica(issueSalvata, `Issue assegnata all'utente #${utenteId}`, autoreId);
    return issueSalvata;
  }
}