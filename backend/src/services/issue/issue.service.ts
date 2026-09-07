// services/issue/issue.service.ts

import { Issue, TipoIssue, StatoIssue } from '../../models/Issue';
import { IssueFactory, DatiCreazioneIssue } from './issue.factory';
import { IssueRepository, FiltriIssue } from '../../repositories/issue/issue.repository';
import { ObserverCronologia, EventoIssue } from '../cronologia/observer-cronologia.interface';

export class IssueService {
  private observers: ObserverCronologia[] = [];

  constructor(private readonly issueRepository: IssueRepository) {}

  attach(observer: ObserverCronologia): void {
    this.observers.push(observer);
  }

  detach(observer: ObserverCronologia): void {
    this.observers = this.observers.filter((o) => o !== observer);
  }

  private async notifica(evento: EventoIssue): Promise<void> {
    for (const observer of this.observers) {
      await observer.aggiorna(evento);
    }
  }

  async segnalaIssue(tipo: TipoIssue, dati: DatiCreazioneIssue): Promise<Issue> {
    const nuovaIssue = IssueFactory.creaIssue(tipo, dati);
    const issueSalvata = await this.issueRepository.save(nuovaIssue);
    await this.notifica({ issue: issueSalvata, descrizione: 'Issue creata', autoreId: dati.segnalatoreId });
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
    await this.notifica({
      issue: issueSalvata,
      descrizione: `Stato cambiato da "${statoPrecedente}" a "${nuovoStato}"`,
      autoreId,
      statoPrecedente,
    });
    return issueSalvata;
  }

  async assegnaA(id: number, utenteId: number, autoreId: number): Promise<Issue> {
    const issue = await this.getIssue(id);
    const assegnatarioPrecedente = issue.assegnatarioId;
    issue.assegnaA(utenteId);
    const issueSalvata = await this.issueRepository.save(issue);
    await this.notifica({
      issue: issueSalvata,
      descrizione: `Issue assegnata all'utente #${utenteId}`,
      autoreId,
      assegnatarioPrecedente,
    });
    return issueSalvata;
  }
}