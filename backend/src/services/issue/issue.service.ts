// services/issue/issue.service.ts

import { Issue, TipoIssue, StatoIssue } from '../../models/Issue';
import { IssueFactory, DatiCreazioneIssue } from './issue.factory';
import { IssueRepository, FiltriIssue } from '../../repositories/issue/issue.repository';
import { TeamRepository } from '../../repositories/team/team.repository';
import { ObserverCronologia, EventoIssue } from '../cronologia/observer-cronologia.interface';

export class IssueService {
  private observers: ObserverCronologia[] = [];

  constructor(
    private readonly issueRepository: IssueRepository,
    private readonly teamRepository: TeamRepository
  ) {}

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

  /**
   * Invariante applicativo: una issue può essere assegnata solo a un
   * utente che appartiene al Team del progetto della issue.
   *
   * Il controllo vive nel Service, non nel Controller, perché è una regola
   * di business e deve valere indipendentemente dal canale che invoca il
   * Service (HTTP, test, import futuri, ecc.).
   */
  private async verificaAssegnatarioDelTeam(progettoId: number, utenteId: number): Promise<void> {
    const team = await this.teamRepository.findByProgettoId(progettoId);
    const appartieneAlTeam = team ? await this.teamRepository.isMembro(team.id, utenteId) : false;

    if (!appartieneAlTeam) {
      throw new Error('ASSEGNATARIO_NON_MEMBRO');
    }
  }

  async segnalaIssue(tipo: TipoIssue, dati: DatiCreazioneIssue): Promise<Issue> {
    if (dati.assegnatarioId !== undefined) {
      await this.verificaAssegnatarioDelTeam(dati.progettoId, dati.assegnatarioId);
    }

    const nuovaIssue = IssueFactory.creaIssue(tipo, dati);
    const issueSalvata = await this.issueRepository.save(nuovaIssue);

    await this.notifica({
      issue: issueSalvata,
      descrizione: 'Issue creata',
      autoreId: dati.segnalatoreId,

      // Esplicito a null (non omesso): per NotificationObserver null significa
      // "prima non esisteva alcun assegnatario", mentre undefined significa
      // "questo evento non riguarda l'assegnazione". In questo modo anche
      // l'assegnazione contestuale alla creazione genera correttamente la
      // notifica al nuovo assegnatario.
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

    if (utenteId !== null) {
      await this.verificaAssegnatarioDelTeam(issue.progettoId, utenteId);
    }

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
