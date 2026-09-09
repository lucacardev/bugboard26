import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IssueService } from '../../../core/services/issue';
import { Issue } from '../../../core/models/issue.model';

@Component({
  selector: 'app-issue-assegnate-list',
  imports: [],
  templateUrl: './issue-assegnate-list.html',
  styleUrl: './issue-assegnate-list.scss',
})
export class IssueAssegnateList implements OnInit {
  private issueService = inject(IssueService);
  private router = inject(Router);

  issue = signal<Issue[]>([]);
  caricamento = signal(true);

  ngOnInit(): void {
    this.issueService.getIssueAssegnateAMe().subscribe({
      next: (issue) => {
        this.issue.set(issue);
        this.caricamento.set(false);
      },
      error: () => this.caricamento.set(false),
    });
  }

  apriIssue(issue: Issue): void {
    this.router.navigate(['/progetti', issue.progettoId, 'issues', issue.id]);
  }
}
