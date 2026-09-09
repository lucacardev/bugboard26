import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
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
  private location = inject(Location);
  private issueService = inject(IssueService);

  // Stato condiviso col servizio (e quindi con il bollino della sidebar):
  // niente più signal locale duplicato.
  notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.notificationService.caricaNotifiche();
  }

  apriNotifica(notifica: Notifica): void {
    if (!notifica.letta) {
      this.notificationService.segnaComeLetta(notifica.id);
    }

    // La notifica conosce solo l'issueId: la issue va recuperata per
    // sapere anche il progettoId, necessario per la route di dettaglio.
    if (notifica.issueId) {
      this.issueService.getIssue(notifica.issueId).subscribe({
        next: (issue) => this.router.navigate(['/progetti', issue.progettoId, 'issues', issue.id]),
      });
    }
  }

  // Coerente con le altre pagine (issue-list, issue-detail, ecc.), tutte
  // dotate di un "torna indietro": qui mancava del tutto.
  torna(): void {
    this.location.back();
  }
}