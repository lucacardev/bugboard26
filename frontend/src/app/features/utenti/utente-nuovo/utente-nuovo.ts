import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user';
import { RuoloUtente } from '../../../core/models/utente.model';

@Component({
  selector: 'app-utente-nuovo',
  imports: [FormsModule],
  templateUrl: './utente-nuovo.html',
  styleUrl: './utente-nuovo.scss',
})
export class UtenteNuovo {
  private router = inject(Router);
  private userService = inject(UserService);

  username = '';
  email = '';
  ruolo: RuoloUtente = 'normale';

  errore = signal('');
  inCorso = signal(false);

  creaUtente(): void {
    if (!this.username.trim() || !this.email.trim()) return;

    this.errore.set('');
    this.inCorso.set(true);

    this.userService.creaUtente(this.username.trim(), this.email.trim(), this.ruolo).subscribe({
      next: () => this.router.navigate(['/progetti']),
      error: (err) => {
        this.inCorso.set(false);
        this.errore.set(
          err.error?.errore?.codice === 'EMAIL_GIA_IN_USO'
            ? 'Questa email è già registrata'
            : 'Errore durante la creazione dell\'utente'
        );
      },
    });
  }

  annulla(): void {
    this.router.navigate(['/progetti']);
  }
}