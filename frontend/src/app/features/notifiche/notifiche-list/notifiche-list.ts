import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NotificationService } from '../../../core/services/notification';
import { IssueService } from '../../../core/services/issue';
import { Notifica } from '../../../core/models/notifica.model';

@Component({
  selector: 'app-notifiche-list',
  imports: [DatePipe],
  templateUrl: './notifiche-list.html',
  styleUrl: './notifiche-list.scss',
})
export class NotificheList implements OnInit {
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private issueService = inject(IssueService);

  notifiche = signal<Notifica[]>([]);
  caricamento = signal(true);

  get nonLette(): number {
    return this.notifiche().filter((n) => !n.letta).length;
  }

  ngOnInit(): void {
    this.caricaNotifiche();
  }

  caricaNotifiche(): void {
    this.notificationService.getNotifiche().subscribe({
      next: (notifiche) => {
        this.notifiche.set(notifiche);
        this.caricamento.set(false);
      },
      error: () => this.caricamento.set(false),
    });
  }

  apriNotifica(notifica: Notifica): void {
    if (!notifica.letta) {
      this.notificationService.segnaComeLetta(notifica.id).subscribe({
        next: (notificaAggiornata) => {
          this.notifiche.update((lista) =>
            lista.map((n) => (n.id === notificaAggiornata.id ? notificaAggiornata : n))
          );
        },
      });
    }

    // La notifica conosce solo l'issueId: la issue va recuperata per
    // sapere anche il progettoId, necessario per la route di dettaglio.
    if (notifica.issueId) {
      this.issueService.getIssue(notifica.issueId).subscribe({
        next: (issue) => this.router.navigate(['/progetti', issue.progettoId, 'issues', issue.id]),
      });
    }
  }
}