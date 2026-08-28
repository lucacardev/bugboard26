import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ProgettoService } from '../../../core/services/progetto';
import { Progetto } from '../../../core/models/progetto.model';
import { Paginator } from '../../../shared/components/paginator/paginator';

@Component({
  selector: 'app-progetti-list',
  imports: [Paginator],
  templateUrl: './progetti-list.html',
  styleUrl: './progetti-list.scss',
})
export class ProgettiList implements OnInit {
  private progettoService = inject(ProgettoService);
  private router = inject(Router);

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

  get isAdmin(): boolean {
    return this.auth.currentUser()?.ruolo === 'amministratore';
  }
}