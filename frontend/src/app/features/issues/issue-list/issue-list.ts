import { Component, inject, OnInit, signal, computed, HostListener } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CdkDropList, CdkDrag, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { IssueService } from '../../../core/services/issue';
import { ProgettoService } from '../../../core/services/progetto';
import { AuthService } from '../../../core/services/auth';
import { TeamService } from '../../../core/services/team';
import { Issue, TipoIssue, StatoIssue } from '../../../core/models/issue.model';
import { Progetto } from '../../../core/models/progetto.model';
import { Utente } from '../../../core/models/utente.model';
import { IssueFormDialog, IssueFormDialogData } from '../../../shared/components/issue-form-dialog/issue-form-dialog';
import { DatiFormIssue } from '../../../shared/components/issue-form/issue-form';
import { Paginator } from '../../../shared/components/paginator/paginator';

interface ColonnaBoard {
  stato: StatoIssue;
  titolo: string;
  dati: () => Issue[];
}

type MenuRapido = 'tipo' | 'priorita' | 'scadenza' | 'assegnatario' | null;

@Component({
  selector: 'app-issue-list',
  imports: [FormsModule, CdkDropList, CdkDrag, Paginator, RouterLink, MatIconModule],
  templateUrl: './issue-list.html',
  styleUrl: './issue-list.scss',
})
export class IssueList implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private issueService = inject(IssueService);
  private progettoService = inject(ProgettoService);
  private teamService = inject(TeamService);
  private auth = inject(AuthService);
  private dialog = inject(MatDialog);

  get isStakeholder(): boolean {
    return this.auth.currentUser()?.ruolo === 'stakeholder';
  }

  get isAdmin(): boolean {
    return this.auth.currentUser()?.ruolo === 'amministratore';
  }

  progettoId = Number(this.route.snapshot.paramMap.get('progettoId'));
  progetto = signal<Progetto | null>(null);
  issue = signal<Issue[]>([]);
  caricamento = signal(true);
  vista = signal<'elenco' | 'board'>('elenco');

  // Membri del team, usati solo per il picker assegnatario nella creazione
  // rapida (visibile solo all'admin, coerente con il dropdown Assegnatario
  // già admin-only in IssueDetail).
  membriTeam = signal<Utente[]>([]);

  filtroTipo: TipoIssue | '' = '';
  filtroStato: StatoIssue | '' = '';
  ordinamento = signal<'recenti' | 'vecchi' | 'titolo' | 'priorita'>('recenti');

  private rangoPriorita: Record<string, number> = { alta: 3, media: 2, bassa: 1 };

  colonnaTodo = signal<Issue[]>([]);
  colonnaInCorso = signal<Issue[]>([]);
  colonnaCompletate = signal<Issue[]>([]);

  colonneBoardId = ['lista-todo', 'lista-in_progress', 'lista-done'];

  colonne: ColonnaBoard[] = [
    { stato: 'todo', titolo: 'Todo', dati: () => this.colonnaTodo() },
    { stato: 'in_progress', titolo: 'In corso', dati: () => this.colonnaInCorso() },
    { stato: 'done', titolo: 'Completate', dati: () => this.colonnaCompletate() },
  ];

  colonnaCreazioneAttiva: StatoIssue | null = null;
  titoloNuovaIssue = '';
  erroreCreazioneRapida = '';

  // Stato della toolbar a icone della creazione rapida (stile Jira)
  tipoNuovaIssue: TipoIssue = 'bug';
  prioritaNuovaIssue = '';
  scadenzaNuovaIssue = '';
  assegnatarioNuovaIssue = '';
  menuRapidoAperto: MenuRapido = null;

  readonly tipiIssue: TipoIssue[] = ['bug', 'question', 'documentation', 'feature'];

  tipoIcone: Record<TipoIssue, string> = {
    bug: 'bug_report',
    question: 'help_outline',
    documentation: 'description',
    feature: 'lightbulb',
  };

  prioritaColori: Record<string, string> = {
    '': 'rgba(0, 0, 0, 0.35)',
    bassa: '#2e7d32',
    media: '#e65100',
    alta: '#c62828',
  };

  paginaCorrente = signal(1);
  dimensionePagina = 10;

  issueOrdinate = computed(() => {
    const lista = [...this.issue()];
    switch (this.ordinamento()) {
      case 'recenti':
        return lista.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'vecchi':
        return lista.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'titolo':
        return lista.sort((a, b) => a.titolo.localeCompare(b.titolo));
      case 'priorita':
        return lista.sort((a, b) => (this.rangoPriorita[b.priorita ?? ''] ?? 0) - (this.rangoPriorita[a.priorita ?? ''] ?? 0));
      default:
        return lista;
    }
  });

  issuePaginate = computed(() => {
    const inizio = (this.paginaCorrente() - 1) * this.dimensionePagina;
    return this.issueOrdinate().slice(inizio, inizio + this.dimensionePagina);
  });

  totalePagine = computed(() => Math.max(1, Math.ceil(this.issue().length / this.dimensionePagina)));

  ngOnInit(): void {
    this.progettoService.getProgetto(this.progettoId).subscribe({
      next: (progetto) => {
        this.progetto.set(progetto);
        if (this.isAdmin) {
          this.teamService.getMembri(progetto.team.id).subscribe({
            next: (membri) => this.membriTeam.set(membri),
          });
        }
      },
    });
    this.caricaIssue();
  }

  caricaIssue(): void {
    this.caricamento.set(true);
    this.issueService
      .getIssueDelProgetto(this.progettoId, {
        tipo: this.filtroTipo || undefined,
        stato: this.filtroStato || undefined,
      })
      .subscribe({
        next: (issue) => {
          this.issue.set(issue);
          this.paginaCorrente.set(1);
          this.colonnaTodo.set(issue.filter((i) => i.stato === 'todo'));
          this.colonnaInCorso.set(issue.filter((i) => i.stato === 'in_progress'));
          this.colonnaCompletate.set(issue.filter((i) => i.stato === 'done'));
          this.caricamento.set(false);
        },
        error: () => this.caricamento.set(false),
      });
  }

  apriIssue(issue: Issue): void {
    this.router.navigate(['/progetti', this.progettoId, 'issues', issue.id]);
  }

  cambiaOrdinamento(valore: string): void {
    this.ordinamento.set(valore as 'recenti' | 'vecchi' | 'titolo' | 'priorita');
    this.paginaCorrente.set(1);
  }

  torna(): void {
    this.router.navigate(['/progetti']);
  }

  drop(event: CdkDragDrop<Issue[]>, nuovoStato: StatoIssue): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    const issueSpostata = event.previousContainer.data[event.previousIndex];
    const statoPrecedente = issueSpostata.stato;

    transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    issueSpostata.stato = nuovoStato;

    this.issueService.cambiaStato(issueSpostata.id, nuovoStato).subscribe({
      error: () => {
        transferArrayItem(event.container.data, event.previousContainer.data, event.currentIndex, event.previousIndex);
        issueSpostata.stato = statoPrecedente;
      },
    });
  }

  nuovaIssue(): void {
    const ref = this.dialog.open<IssueFormDialog, IssueFormDialogData, DatiFormIssue>(IssueFormDialog, {
      width: '500px',
      data: { titolo: 'Nuova issue', testoBottone: 'Crea issue' },
    });

    ref.afterClosed().subscribe((dati) => {
      if (dati) {
        this.issueService.creaIssue(this.progettoId, dati).subscribe({
          next: () => this.caricaIssue(),
        });
      }
    });
  }

  apriCreazioneInline(): void {
    this.colonnaCreazioneAttiva = 'todo';
    this.titoloNuovaIssue = '';
    this.tipoNuovaIssue = 'bug';
    this.prioritaNuovaIssue = '';
    this.scadenzaNuovaIssue = '';
    this.assegnatarioNuovaIssue = '';
    this.menuRapidoAperto = null;
    this.erroreCreazioneRapida = '';
  }

  annullaCreazioneInline(): void {
    this.colonnaCreazioneAttiva = null;
    this.titoloNuovaIssue = '';
    this.menuRapidoAperto = null;
    this.erroreCreazioneRapida = '';
  }

  toggleMenuRapido(nome: MenuRapido): void {
    this.menuRapidoAperto = this.menuRapidoAperto === nome ? null : nome;
  }

  // Chiude il menu rapido aperto se si clicca in un punto qualunque della
  // pagina che non sia dentro il wrapper dell'icona/menu stesso.
  @HostListener('document:click', ['$event'])
  chiudiMenuRapidoSuClickEsterno(event: MouseEvent): void {
    if (!this.menuRapidoAperto) return;
    const target = event.target as HTMLElement;
    if (!target.closest('.icona-rapida-wrapper')) {
      this.menuRapidoAperto = null;
    }
  }

  impostaTipoRapido(tipo: TipoIssue): void {
    this.tipoNuovaIssue = tipo;
    this.menuRapidoAperto = null;
  }

  impostaPrioritaRapida(priorita: string): void {
    this.prioritaNuovaIssue = priorita;
    this.menuRapidoAperto = null;
  }

  impostaScadenzaRapida(valore: string): void {
    this.scadenzaNuovaIssue = valore;
    this.menuRapidoAperto = null;
  }

  impostaAssegnatarioRapido(valore: string): void {
    this.assegnatarioNuovaIssue = valore;
    this.menuRapidoAperto = null;
  }

  nomeAssegnatarioRapido(): string {
    const membro = this.membriTeam().find((m) => m.id === Number(this.assegnatarioNuovaIssue));
    return membro?.username ?? '';
  }

  // Uno stakeholder non è un lavoratore assegnabile (punto 15, sola lettura),
  // stesso filtro già applicato in IssueDetail.
  get membriAssegnabili(): Utente[] {
    return this.membriTeam().filter((m) => m.ruolo !== 'stakeholder');
  }

  confermaCreazioneInline(): void {
    const titolo = this.titoloNuovaIssue.trim();
    if (!titolo) {
      this.erroreCreazioneRapida = 'Inserisci un titolo per la issue';
      return;
    }
    this.erroreCreazioneRapida = '';

    // Data di inizio impostata di default ad oggi, non richiesta esplicitamente
    // nella toolbar rapida (solo la scadenza è un campo a scelta dell'utente).
    const oggi = new Date().toISOString().substring(0, 10);

    this.issueService
      .creaIssue(this.progettoId, {
        titolo,
        tipo: this.tipoNuovaIssue,
        priorita: this.prioritaNuovaIssue || undefined,
        dataInizio: oggi,
        dataScadenza: this.scadenzaNuovaIssue || undefined,
        assegnatarioId: this.assegnatarioNuovaIssue ? Number(this.assegnatarioNuovaIssue) : undefined,
      })
      .subscribe({
        next: () => {
          this.annullaCreazioneInline();
          this.caricaIssue();
        },
      });
  }
}