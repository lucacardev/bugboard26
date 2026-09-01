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
import { Issue, StatoIssue } from '../../../core/models/issue.model';
import { Progetto } from '../../../core/models/progetto.model';
import { Utente } from '../../../core/models/utente.model';
import { Commento } from '../../../core/models/commento.model';
import { VoceCronologia } from '../../../core/models/cronologia.model';

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

  progettoId = Number(this.route.snapshot.paramMap.get('progettoId'));
  issueId = Number(this.route.snapshot.paramMap.get('issueId'));

  issue = signal<Issue | null>(null);
  progetto = signal<Progetto | null>(null);
  membriTeam = signal<Utente[]>([]);
  commenti = signal<Commento[]>([]);
  cronologia = signal<VoceCronologia[]>([]);
  caricamento = signal(true);

  nuovoCommento = '';

  ngOnInit(): void {
    this.caricaIssue();
    this.caricaCommenti();
    this.caricaCronologia();
  }

  caricaIssue(): void {
    this.issueService.getIssue(this.issueId).subscribe({
      next: (issue) => {
        this.issue.set(issue);
        this.progettoService.getProgetto(issue.progettoId).subscribe({
          next: (progetto) => {
            this.progetto.set(progetto);
            this.teamService.getMembri(progetto.teamId).subscribe({
              next: (membri) => this.membriTeam.set(membri),
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

  get isAdmin(): boolean {
    return this.auth.currentUser()?.ruolo === 'amministratore';
  }

  get puoModificareStato(): boolean {
    const utente = this.auth.currentUser();
    const issueAttuale = this.issue();
    if (!utente || !issueAttuale) return false;
    return this.isAdmin || utente.id === issueAttuale.assegnatarioId;
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

  nomeMembro(utenteId: number | null): string {
    if (!utenteId) return 'Non assegnata';
    const membro = this.membriTeam().find((m) => m.id === utenteId);
    return membro?.username ?? `Utente #${utenteId}`;
  }

  torna(): void {
    this.router.navigate(['/progetti', this.progettoId, 'issues']);
  }
}