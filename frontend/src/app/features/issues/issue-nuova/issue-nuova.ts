import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IssueForm, DatiFormIssue } from '../../../shared/components/issue-form/issue-form';
import { IssueService } from '../../../core/services/issue';

@Component({
  selector: 'app-issue-nuova',
  imports: [IssueForm],
  templateUrl: './issue-nuova.html',
  styleUrl: './issue-nuova.scss',
})
export class IssueNuova {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private issueService = inject(IssueService);

  progettoId = Number(this.route.snapshot.paramMap.get('progettoId'));

  creaIssue(dati: DatiFormIssue): void {
    this.issueService.creaIssue(this.progettoId, dati).subscribe({
      next: () => this.router.navigate(['/progetti', this.progettoId, 'issues']),
    });
  }

  annulla(): void {
    this.router.navigate(['/progetti', this.progettoId, 'issues']);
  }
}