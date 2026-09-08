import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CdkDropList, CdkDrag, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { IssueService } from '../../../core/services/issue';
import { ProgettoService } from '../../../core/services/progetto';
import { AuthService } from '../../../core/services/auth';
import { Issue, TipoIssue, StatoIssue } from '../../../core/models/issue.model';
import { Progetto } from '../../../core/models/progetto.model';
import { IssueFormDialog, IssueFormDialogData } from '../../../shared/components/issue-form-dialog/issue-form-dialog';
import { DatiFormIssue } from '../../../shared/components/issue-form/issue-form';
import { Paginator } from '../../../shared/components/paginator/paginator';

interface ColonnaBoard {
  stato: StatoIssue;
  titolo: string;
  dati: () => Issue[];
}

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
  private auth = inject(AuthService);
  private dialog = inject(MatDialog);

  get isStakeholder(): boolean {
    return this.auth.currentUser()?.ruolo === 'stakeholder';
  }

  progettoId = Number(this.route.snapshot.paramMap.get('progettoId'));
  progetto = signal<Progetto | null>(null);
  issue = signal<Issue[]>([]);
  caricamento = signal(true);
  vista = signal<'elenco' | 'board'>('elenco');

  filtroTipo: TipoIssue | '' = '';
  filtroStato: StatoIssue | '' = '';

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

  paginaCorrente = signal(1);
  dimensionePagina = 10;

  issuePaginate = computed(() => {
    const inizio = (this.paginaCorrente() - 1) * this.dimensionePagina;
    return this.issue().slice(inizio, inizio + this.dimensionePagina);
  });

  totalePagine = computed(() => Math.max(1, Math.ceil(this.issue().length / this.dimensionePagina)));

  ngOnInit(): void {
    this.progettoService.getProgetto(this.progettoId).subscribe({
      next: (progetto) => this.progetto.set(progetto),
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
  }

  annullaCreazioneInline(): void {
    this.colonnaCreazioneAttiva = null;
    this.titoloNuovaIssue = '';
  }

  confermaCreazioneInline(): void {
    const titolo = this.titoloNuovaIssue.trim();
    if (!titolo) {
      this.annullaCreazioneInline();
      return;
    }

    this.issueService.creaIssue(this.progettoId, { titolo, tipo: 'bug' }).subscribe({
      next: () => {
        this.annullaCreazioneInline();
        this.caricaIssue();
      },
    });
  }
}