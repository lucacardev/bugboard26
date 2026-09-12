import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth';
import { IssueService } from '../../../core/services/issue';
import { ProgettoService } from '../../../core/services/progetto';
import { TeamService } from '../../../core/services/team';
import { CommentoService } from '../../../core/services/comment';
import { CronologiaService } from '../../../core/services/cronologia';
import { EtichettaService } from '../../../core/services/etichetta';
import { AttachmentService } from '../../../core/services/attachment';
import { Issue, StatoIssue } from '../../../core/models/issue.model';
import { Progetto } from '../../../core/models/progetto.model';
import { Utente } from '../../../core/models/utente.model';
import { Commento } from '../../../core/models/commento.model';
import { VoceCronologia } from '../../../core/models/cronologia.model';
import { Etichetta } from '../../../core/models/etichetta.model';
import { Allegato } from '../../../core/models/allegato.model';

const COLORI_ETICHETTA = ['#3949ab', '#e65100', '#2e7d32', '#c62828', '#6a1b9a', '#00838f'];
const DIMENSIONE_MASSIMA_BYTES = 10 * 1024 * 1024; // 10 MB, stesso limite del backend

@Component({
  selector: 'app-issue-detail',
  imports: [FormsModule, DatePipe, MatIconModule],
  templateUrl: './issue-detail.html',
  styleUrl: './issue-detail.scss',
})
export class IssueDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private destroyRef = inject(DestroyRef);
  private auth = inject(AuthService);
  private issueService = inject(IssueService);
  private progettoService = inject(ProgettoService);
  private teamService = inject(TeamService);
  private commentoService = inject(CommentoService);
  private cronologiaService = inject(CronologiaService);
  private etichettaService = inject(EtichettaService);
  private attachmentService = inject(AttachmentService);

  // NOTA: progettoId/issueId NON sono più letti una sola volta via
  // `.snapshot` al costruttore. Angular, di default (BaseRouteReuseStrategy),
  // riusa la stessa istanza di componente quando due navigazioni risolvono
  // allo stesso routeConfig (stessa "forma" di rotta, es.
  // 'progetti/:progettoId/issues/:issueId') e cambiano solo i parametri: in
  // quel caso ngOnInit NON viene richiamato di nuovo, quindi uno snapshot
  // letto una sola volta resterebbe bloccato sui valori della prima issue
  // aperta. Ci si sottoscrive quindi a `paramMap` (Observable) e si
  // ricaricano tutti i dati ogni volta che cambia.
  progettoId = 0;
  issueId = 0;

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

  allegati = signal<Allegato[]>([]);
  uploadInCorso = signal(false);
  erroreAllegato = signal('');

  nuovoCommento = '';

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.progettoId = Number(params.get('progettoId'));
      this.issueId = Number(params.get('issueId'));
      this.caricaTutto();
    });
  }

  // Punto d'ingresso unico per (ri)caricare tutti i dati della issue
  // corrente: chiamato sia al primo ingresso sia ogni volta che
  // progettoId/issueId cambiano perché il componente è stato riusato.
  private caricaTutto(): void {
    this.caricamento.set(true);
    this.issue.set(null);
    this.caricaIssue();
    this.caricaCommenti();
    if (!this.isStakeholder) {
      this.caricaCronologia();
    } else {
      this.cronologia.set([]);
    }
    this.caricaEtichetteIssue();
    this.caricaAllegati();
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

  caricaAllegati(): void {
    this.attachmentService.getAllegatiIssue(this.issueId).subscribe({
      next: (allegati) => this.allegati.set(allegati),
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

  assegna(assegnatarioId: string | number | null): void {
    const valore = assegnatarioId === null || assegnatarioId === '' ? null : Number(assegnatarioId);
    this.issueService.assegnaIssue(this.issueId, valore).subscribe({
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
      error: () => alert('Si è verificato un errore durante l\'invio del commento. Riprova.'),
    });
  }

  commentoInModificaId: number | null = null;
  testoModificaCommento = '';

  apriModificaCommento(commento: Commento): void {
    this.commentoInModificaId = commento.id;
    this.testoModificaCommento = commento.testo;
  }

  annullaModificaCommento(): void {
    this.commentoInModificaId = null;
    this.testoModificaCommento = '';
  }

  confermaModificaCommento(): void {
    const testo = this.testoModificaCommento.trim();
    if (!testo || this.commentoInModificaId === null) return;

    this.commentoService.modificaCommento(this.commentoInModificaId, testo).subscribe({
      next: () => {
        this.annullaModificaCommento();
        this.caricaCommenti();
      },
      error: () => alert('Si è verificato un errore durante la modifica del commento. Riprova.'),
    });
  }

  eliminaCommentoFile(commento: Commento): void {
    if (!confirm('Eliminare questo commento?')) return;
    this.commentoService.eliminaCommento(commento.id).subscribe({
      next: () => this.caricaCommenti(),
      error: () => alert('Si è verificato un errore durante l\'eliminazione del commento. Riprova.'),
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

  // Tipi ammessi indipendentemente dal tipo di issue — specchia lato
  // frontend Issue.tipiAllegatoConsentiti() del backend, che resta comunque
  // l'unica fonte di verità autorevole (questo è solo un anticipo di UX).
  private readonly tipiMimeConsentiti = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf'];

  get accettaFile(): string {
    return this.tipiMimeConsentiti.join(',');
  }

  onFileSelezionato(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // permette di riselezionare lo stesso file una seconda volta
    if (!file) return;

    this.erroreAllegato.set('');

    // Validazione lato client: stesso vincolo del backend, per un feedback
    // immediato senza dover aspettare il giro di rete (il backend resta
    // comunque l'unica fonte di verità, questo è solo un anticipo di UX).
    if (!this.tipiMimeConsentiti.includes(file.type)) {
      this.erroreAllegato.set('Formato non supportato. Sono ammesse immagini (PNG, JPEG, GIF, WEBP) o PDF.');
      return;
    }
    if (file.size > DIMENSIONE_MASSIMA_BYTES) {
      this.erroreAllegato.set('Il file supera la dimensione massima consentita di 10 MB.');
      return;
    }

    this.uploadInCorso.set(true);

    this.attachmentService.richiediUploadUrl(this.issueId, file.name, file.type).subscribe({
      next: ({ uploadUrl, urlKey }) => {
        this.attachmentService.caricaSuS3(uploadUrl, file).subscribe({
          next: () => {
            this.attachmentService.confermaCaricamento(urlKey, file.name, this.issueId).subscribe({
              next: () => {
                this.uploadInCorso.set(false);
                this.caricaAllegati();
              },
              error: () => {
                this.uploadInCorso.set(false);
                this.erroreAllegato.set('Caricamento su S3 riuscito ma la conferma al server è fallita.');
              },
            });
          },
          error: () => {
            this.uploadInCorso.set(false);
            this.erroreAllegato.set('Errore durante il caricamento del file.');
          },
        });
      },
      error: () => {
        this.uploadInCorso.set(false);
        this.erroreAllegato.set('Errore durante la richiesta di caricamento.');
      },
    });
  }

  scaricaAllegato(allegato: Allegato): void {
    this.attachmentService.richiediDownloadUrl(allegato.id).subscribe({
      next: ({ downloadUrl }) => window.open(downloadUrl, '_blank'),
    });
  }

  eliminaAllegatoFile(allegato: Allegato): void {
    if (!confirm(`Eliminare l'allegato "${allegato.nomeFile}"?`)) return;
    this.attachmentService.eliminaAllegato(allegato.id).subscribe({
      next: () => this.caricaAllegati(),
      error: () => alert('Si è verificato un errore durante l\'eliminazione dell\'allegato. Riprova.'),
    });
  }

  formattaDimensione(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  nomeMembro(utenteId: number | null): string {
    if (!utenteId) return 'Non assegnata';
    return this.nomeUtenteDaId(utenteId);
  }

  // Come nomeMembro, ma per l'autore di un commento: mostra "Tu" se coincide
  // con l'utente attualmente autenticato, altrimenti l'username reale incluso
  // dal backend (fallback alla lookup tra i membri solo per sicurezza, es. se
  // per qualche motivo la risposta non include l'autore).
  nomeAutore(commento: Commento): string {
    if (this.eMio(commento.autoreId)) return 'Tu';
    return commento.autore?.username ?? this.nomeUtenteDaId(commento.autoreId);
  }

  // Usato anche dal template per lo stile distintivo dei propri commenti, e
  // per determinare se l'utente corrente può modificare/eliminare un
  // commento o un allegato (autoreId/caricatoDa può essere null per un
  // allegato precedente all'introduzione di questo campo — in quel caso
  // non è mai "mio", resta eliminabile solo da un amministratore).
  eMio(autoreId: number | null): boolean {
    return autoreId !== null && autoreId === this.auth.currentUser()?.id;
  }

  private nomeUtenteDaId(utenteId: number): string {
    const membro = this.membriTeam().find((m) => m.id === utenteId);
    return membro?.username ?? `Utente #${utenteId}`;
  }

  // Il "torna indietro" ora usa la history reale del browser (stesso
  // comportamento del tasto Indietro).
  torna(): void {
    this.location.back();
  }
}