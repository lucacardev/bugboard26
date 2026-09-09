import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { TeamService } from '../../../core/services/team';
import { UserService } from '../../../core/services/user';
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
  private userService = inject(UserService);

  auth = inject(AuthService);
  teamId = Number(this.route.snapshot.paramMap.get('teamId'));
  progettoIdOrigine = this.route.snapshot.queryParamMap.get('progettoId');

  nomeTeam = signal<string | null>(null);
  membri = signal<Utente[]>([]);
  tuttiGliUtenti = signal<Utente[]>([]);
  caricamento = signal(true);

  aggiuntaAttiva = false;
  utenteDaAggiungere = '';
  errore = '';

  // Utenti non ancora membri di questo team, unici candidati selezionabili.
  // Gli amministratori sono esclusi: la traccia (punto 4, 9) li tratta sempre come
  // agenti che assegnano/governano le issue, mai come membri operativi di un team;
  // il loro accesso completo (punto 9) è già garantito via ruolo, non via appartenenza.
  utentiDisponibili = computed(() => {
    const idGiaMembri = new Set(this.membri().map((m) => m.id));
    return this.tuttiGliUtenti().filter((u) => !idGiaMembri.has(u.id) && u.ruolo !== 'amministratore');
  });

  get isAdmin(): boolean {
    return this.auth.currentUser()?.ruolo === 'amministratore';
  }

  ngOnInit(): void {
    this.teamService.getTeam(this.teamId).subscribe({
      next: (team) => this.nomeTeam.set(team.nome),
    });
    this.caricaMembri();
    if (this.isAdmin) {
      this.userService.getTuttiGliUtenti().subscribe({
        next: (utenti) => this.tuttiGliUtenti.set(utenti),
      });
    }
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

  apriAggiunta(): void {
    this.aggiuntaAttiva = true;
    this.utenteDaAggiungere = '';
    this.errore = '';
  }

  annullaAggiunta(): void {
    this.aggiuntaAttiva = false;
    this.errore = '';
  }

  confermaAggiunta(): void {
    if (!this.utenteDaAggiungere) return;

    this.teamService.aggiungiMembro(this.teamId, Number(this.utenteDaAggiungere)).subscribe({
      next: () => {
        this.annullaAggiunta();
        this.caricaMembri();
      },
      error: (err) => {
        this.errore =
          err.error?.errore?.codice === 'UTENTE_GIA_MEMBRO'
            ? 'Questo utente è già membro del team'
            : 'Errore durante l\'aggiunta del membro';
      },
    });
  }

  rimuoviMembro(utenteId: number): void {
    if (!confirm('Rimuovere questo membro dal team?')) return;

    this.teamService.rimuoviMembro(this.teamId, utenteId).subscribe({
      next: () => this.caricaMembri(),
      error: () => alert('Errore durante la rimozione del membro'),
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