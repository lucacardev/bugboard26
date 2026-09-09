import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { IssueService } from '../../../core/services/issue';
import { ProgettoService } from '../../../core/services/progetto';
import { TeamService } from '../../../core/services/team';
import { CommentoService } from '../../../core/services/comment';
import { CronologiaService } from '../../../core/services/cronologia';
import { EtichettaService } from '../../../core/services/etichetta';
import { Issue, StatoIssue } from '../../../core/models/issue.model';
import { Progetto } from '../../../core/models/progetto.model';
import { Utente } from '../../../core/models/utente.model';
import { Commento } from '../../../core/models/commento.model';
import { VoceCronologia } from '../../../core/models/cronologia.model';
import { Etichetta } from '../../../core/models/etichetta.model';

const COLORI_ETICHETTA = ['#3949ab', '#e65100', '#2e7d32', '#c62828', '#6a1b9a', '#00838f'];

@Component({
  selector: 'app-issue-detail',
  imports: [FormsModule, DatePipe],
  templateUrl: './issue-detail.html',
  styleUrl: './issue-detail.scss',
})
export class IssueDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private issueService = inject(IssueService);
  private progettoService = inject(ProgettoService);
  private teamService = inject(TeamService);
  private commentoService = inject(CommentoService);
  private cronologiaService = inject(CronologiaService);
  private etichettaService = inject(EtichettaService);

  progettoId = Number(this.route.snapshot.paramMap.get('progettoId'));
  issueId = Number(this.route.snapshot.paramMap.get('issueId'));

  issue = signal<Issue | null>(null);
  progetto = signal<Progetto | null>(null);
  membriTeam = signal<Utente[]>([]);
  commenti = signal<Commento[]>([]);
  cronologia = signal<VoceCronologia[]>([]);
  caricamento = signal(true);

  etichetteIssue = signal<Etichetta[]>([]);
  etichetteProgetto = signal<Etichetta[]>([]);
  aggiuntaEtichettaAttiva = false;
  testoNuovaEtichetta = '';

  nuovoCommento = '';

  ngOnInit(): void {
    this.caricaIssue();
    this.caricaCommenti();
    if (!this.isStakeholder) {
      this.caricaCronologia();
    }
    this.caricaEtichetteIssue();
  }

  caricaIssue(): void {
    this.issueService.getIssue(this.issueId).subscribe({
      next: (issue) => {
        this.issue.set(issue);
        this.progettoService.getProgetto(issue.progettoId).subscribe({
          next: (progetto) => {
            this.progetto.set(progetto);
            this.teamService.getMembri(progetto.team.id).subscribe({
              next: (membri) => this.membriTeam.set(membri),
            });
            this.etichettaService.getEtichetteProgetto(progetto.id).subscribe({
              next: (etichette) => this.etichetteProgetto.set(etichette),
            });
            this.caricamento.set(false);
          },
        });
      },
      error: () => this.caricamento.set(false),
    });
  }

  caricaCommenti(): void {
    this.commentoService.getCommentiIssue(this.issueId).subscribe({
      next: (commenti) => this.commenti.set([...commenti].reverse()),
    });
  }

  caricaCronologia(): void {
    this.cronologiaService.getCronologiaIssue(this.issueId).subscribe({
      next: (cronologia) => this.cronologia.set([...cronologia].reverse()),
    });
  }

  caricaEtichetteIssue(): void {
    this.etichettaService.getEtichetteIssue(this.issueId).subscribe({
      next: (etichette) => this.etichetteIssue.set(etichette),
    });
  }

  get isAdmin(): boolean {
    return this.auth.currentUser()?.ruolo === 'amministratore';
  }

  get isStakeholder(): boolean {
    return this.auth.currentUser()?.ruolo === 'stakeholder';
  }

  // Uno stakeholder può essere membro di un team (per la visibilità sul
  // progetto) ma non è un lavoratore assegnabile alle issue: punto 15,
  // account in sola lettura.
  get membriAssegnabili(): Utente[] {
    return this.membriTeam().filter((m) => m.ruolo !== 'stakeholder');
  }

  get puoModificareStato(): boolean {
    const utente = this.auth.currentUser();
    const issueAttuale = this.issue();
    if (!utente || !issueAttuale) return false;
    return this.isAdmin || utente.id === issueAttuale.assegnatarioId;
  }

  // Etichette non ancora associate a questa issue, disponibili da aggiungere
  get etichetteDisponibili(): Etichetta[] {
    const idGiaAssociati = new Set(this.etichetteIssue().map((e) => e.id));
    return this.etichetteProgetto().filter((e) => !idGiaAssociati.has(e.id));
  }

  cambiaStato(nuovoStato: StatoIssue): void {
    this.issueService.cambiaStato(this.issueId, nuovoStato).subscribe({
      next: (issueAggiornata) => {
        this.issue.set(issueAggiornata);
        this.caricaCronologia();
      },
      error: () => alert('Non sei autorizzato a modificare lo stato di questa issue'),
    });
  }

  cambiaPriorita(nuovaPriorita: string | null): void {
    this.issueService.cambiaPriorita(this.issueId, nuovaPriorita).subscribe({
      next: (issueAggiornata) => {
        this.issue.set(issueAggiornata);
        this.caricaCronologia();
      },
      error: () => alert('Non sei autorizzato a modificare la priorità di questa issue'),
    });
  }

  aggiornaDataInizio(valore: string): void {
    const issueAttuale = this.issue();
    if (!issueAttuale) return;
    this.salvaDate(valore || null, issueAttuale.dataScadenza);
  }

  aggiornaDataScadenza(valore: string): void {
    const issueAttuale = this.issue();
    if (!issueAttuale) return;
    this.salvaDate(issueAttuale.dataInizio, valore || null);
  }

  private salvaDate(dataInizio: string | null, dataScadenza: string | null): void {
    this.issueService.cambiaDate(this.issueId, dataInizio, dataScadenza).subscribe({
      next: (issueAggiornata) => {
        this.issue.set(issueAggiornata);
        this.caricaCronologia();
      },
      error: () => alert('Non sei autorizzato a modificare le date di questa issue'),
    });
  }

  assegna(assegnatarioId: string): void {
    if (!assegnatarioId) return;
    this.issueService.assegnaIssue(this.issueId, Number(assegnatarioId)).subscribe({
      next: (issueAggiornata) => {
        this.issue.set(issueAggiornata);
        this.caricaCronologia();
      },
    });
  }

  inviaCommento(): void {
    const testo = this.nuovoCommento.trim();
    if (!testo) return;

    this.commentoService.scriviCommento(this.issueId, testo).subscribe({
      next: () => {
        this.nuovoCommento = '';
        this.caricaCommenti();
      },
    });
  }

  aggiungiEtichettaEsistente(etichettaId: string): void {
    if (!etichettaId) return;
    this.etichettaService.associaAIssue(this.issueId, Number(etichettaId)).subscribe({
      next: () => this.caricaEtichetteIssue(),
    });
  }

  apriCreazioneEtichetta(): void {
    this.aggiuntaEtichettaAttiva = true;
    this.testoNuovaEtichetta = '';
  }

  annullaCreazioneEtichetta(): void {
    this.aggiuntaEtichettaAttiva = false;
    this.testoNuovaEtichetta = '';
  }

  confermaCreazioneEtichetta(): void {
    const testo = this.testoNuovaEtichetta.trim();
    if (!testo) {
      this.annullaCreazioneEtichetta();
      return;
    }

    const colore = COLORI_ETICHETTA[Math.floor(Math.random() * COLORI_ETICHETTA.length)];

    this.etichettaService.creaEtichetta(testo, colore, this.progettoId).subscribe({
      next: (nuovaEtichetta) => {
        this.etichetteProgetto.update((lista) => [...lista, nuovaEtichetta]);
        this.etichettaService.associaAIssue(this.issueId, nuovaEtichetta.id).subscribe({
          next: () => {
            this.annullaCreazioneEtichetta();
            this.caricaEtichetteIssue();
          },
        });
      },
      error: () => alert('Non sei autorizzato a creare etichette in questo progetto (devi essere membro del team)'),
    });
  }

  rimuoviEtichetta(etichettaId: number): void {
    this.etichettaService.rimuoviDaIssue(this.issueId, etichettaId).subscribe({
      next: () => this.caricaEtichetteIssue(),
    });
  }

  nomeMembro(utenteId: number | null): string {
    if (!utenteId) return 'Non assegnata';
    return this.nomeUtenteDaId(utenteId);
  }

  // Come nomeMembro, ma per l'autore di un commento: mostra "Tu" se coincide
  // con l'utente attualmente autenticato, altrimenti il nome del membro (o
  // il fallback "Utente #N" se non fa più parte del team, es. rimosso in seguito).
  nomeAutore(autoreId: number): string {
    return this.eMio(autoreId) ? 'Tu' : this.nomeUtenteDaId(autoreId);
  }

  // Usato anche dal template per lo stile distintivo dei propri commenti.
  eMio(autoreId: number): boolean {
    return autoreId === this.auth.currentUser()?.id;
  }

  private nomeUtenteDaId(utenteId: number): string {
    const membro = this.membriTeam().find((m) => m.id === utenteId);
    return membro?.username ?? `Utente #${utenteId}`;
  }

  torna(): void {
    this.router.navigate(['/progetti', this.progettoId, 'issues']);
  }
}