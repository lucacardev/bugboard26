import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { TeamService } from '../../../core/services/team';
import { Utente } from '../../../core/models/utente.model';

@Component({
  selector: 'app-team-detail',
  imports: [FormsModule],
  templateUrl: './team-detail.html',
  styleUrl: './team-detail.scss',
})
export class TeamDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private teamService = inject(TeamService);

  auth = inject(AuthService);
  teamId = Number(this.route.snapshot.paramMap.get('teamId'));
  progettoIdOrigine = this.route.snapshot.queryParamMap.get('progettoId');

  membri = signal<Utente[]>([]);
  caricamento = signal(true);

  get isAdmin(): boolean {
    return this.auth.currentUser()?.ruolo === 'amministratore';
  }

  ngOnInit(): void {
    this.caricaMembri();
  }

  caricaMembri(): void {
    this.caricamento.set(true);
    this.teamService.getMembri(this.teamId).subscribe({
      next: (membri) => {
        this.membri.set(membri);
        this.caricamento.set(false);
      },
      error: () => this.caricamento.set(false),
    });
  }

  torna(): void {
    if (this.progettoIdOrigine) {
      this.router.navigate(['/progetti', this.progettoIdOrigine, 'issues']);
    } else {
      this.router.navigate(['/progetti']);
    }
  }
}