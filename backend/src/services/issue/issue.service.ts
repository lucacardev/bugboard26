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
    await this.notifica({
      issue: issueSalvata,
      descrizione: 'Issue creata',
      autoreId: dati.segnalatoreId,

      // Esplicito a null (non omesso): un'issue appena creata non ha mai
      // avuto un assegnatario precedente. Senza questo campo,
      // NotificationObserver non può distinguere "nessuna informazione
      // sull'assegnazione in questo evento" (undefined, es. un semplice
      // cambio di stato) da "l'issue nasce senza assegnatario" (null) — e
      // se l'Estensione #3 (punto 4 traccia) crea l'issue con un
      // assegnatario già scelto dall'admin, quella persona non riceverebbe
      // mai la notifica di assegnazione altrimenti.
      
      assegnatarioPrecedente: null,
    });
    return issueSalvata;
  }

  async visualizzaIssueProgetto(progettoId: number, filtri?: FiltriIssue): Promise<Issue[]> {
    return this.issueRepository.findByProgetto(progettoId, filtri);
  }

  async getIssueAssegnateA(utenteId: number): Promise<Issue[]> {
    return this.issueRepository.findByAssegnatario(utenteId);
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

  async cambiaPriorita(id: number, nuovaPriorita: string | null, autoreId: number): Promise<Issue> {
    const issue = await this.getIssue(id);
    const prioritaPrecedente = issue.priorita;
    issue.cambiaPriorita(nuovaPriorita);
    const issueSalvata = await this.issueRepository.save(issue);
    await this.notifica({
      issue: issueSalvata,
      descrizione: `Priorità cambiata da "${prioritaPrecedente ?? 'nessuna'}" a "${nuovaPriorita ?? 'nessuna'}"`,
      autoreId,
    });
    return issueSalvata;
  }

  async cambiaDate(id: number, dataInizio: Date | null, dataScadenza: Date | null, autoreId: number): Promise<Issue> {
    const issue = await this.getIssue(id);
    issue.cambiaDate(dataInizio, dataScadenza);
    const issueSalvata = await this.issueRepository.save(issue);
    await this.notifica({
      issue: issueSalvata,
      descrizione: 'Date della issue aggiornate',
      autoreId,
    });
    return issueSalvata;
  }

  async assegnaA(id: number, utenteId: number | null, autoreId: number): Promise<Issue> {
    const issue = await this.getIssue(id);
    const assegnatarioPrecedente = issue.assegnatarioId;
    issue.assegnaA(utenteId);
    const issueSalvata = await this.issueRepository.save(issue);
    await this.notifica({
      issue: issueSalvata,
      descrizione: utenteId === null ? 'Issue de-assegnata' : `Issue assegnata all'utente #${utenteId}`,
      autoreId,
      assegnatarioPrecedente,
    });
    return issueSalvata;
  }
}