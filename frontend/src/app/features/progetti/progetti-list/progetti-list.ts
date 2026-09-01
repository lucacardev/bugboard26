import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../core/services/auth';
import { ProgettoService } from '../../../core/services/progetto';
import { Progetto } from '../../../core/models/progetto.model';
import { Paginator } from '../../../shared/components/paginator/paginator';
import { ProgettoFormDialog, DatiFormProgetto } from '../../../shared/components/progetto-form-dialog/progetto-form-dialog';

@Component({
  selector: 'app-progetti-list',
  imports: [Paginator],
  templateUrl: './progetti-list.html',
  styleUrl: './progetti-list.scss',
})
export class ProgettiList implements OnInit {
  private progettoService = inject(ProgettoService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  auth = inject(AuthService);
  progetti = signal<Progetto[]>([]);
  caricamento = signal(true);

  paginaCorrente = signal(1);
  dimensionePagina = 9;

  progettiPaginati = computed(() => {
    const inizio = (this.paginaCorrente() - 1) * this.dimensionePagina;
    return this.progetti().slice(inizio, inizio + this.dimensionePagina);
  });

  totalePagine = computed(() => Math.max(1, Math.ceil(this.progetti().length / this.dimensionePagina)));

  ngOnInit(): void {
    this.caricaProgetti();
  }

  caricaProgetti(): void {
    const utente = this.auth.currentUser();
    const chiamata =
      utente?.ruolo === 'amministratore'
        ? this.progettoService.getTuttiIProgetti()
        : this.progettoService.getProgettiUtente(utente!.id);

    chiamata.subscribe({
      next: (progetti) => {
        this.progetti.set(progetti);
        this.caricamento.set(false);
      },
      error: () => this.caricamento.set(false),
    });
  }

  apriProgetto(progetto: Progetto): void {
    this.router.navigate(['/progetti', progetto.id, 'issues']);
  }

  nuovoProgetto(): void {
    const ref = this.dialog.open<ProgettoFormDialog, void, DatiFormProgetto>(ProgettoFormDialog, {
      width: '450px',
    });

    ref.afterClosed().subscribe((dati) => {
      if (dati) {
        this.progettoService.creaProgetto(dati.nome, dati.descrizione, dati.nomeTeam).subscribe({
          next: () => this.caricaProgetti(),
          error: () => alert('Errore durante la creazione del progetto'),
        });
      }
    });
  }

  get isAdmin(): boolean {
    return this.auth.currentUser()?.ruolo === 'amministratore';
  }
}