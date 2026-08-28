import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-completa-primo-accesso',
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule],
  templateUrl: './completa-primo-accesso.html',
  styleUrl: './completa-primo-accesso.scss',
})
export class CompletaPrimoAccesso {
  private router = inject(Router);
  private auth = inject(AuthService);

  // Ricevuti dal login tramite router state, mai esposti nell'URL
  private email = (history.state?.email as string) ?? '';
  private session = (history.state?.session as string) ?? '';

  nuovaPassword = '';
  confermaPassword = '';
  messaggioErrore = '';
  inCorso = false;

  // Se l'utente arriva qui senza essere passato dal login (es. refresh diretto sull'URL), non ha i dati necessari
  datiMancanti = !this.email || !this.session;

  completa(): void {
    if (this.nuovaPassword !== this.confermaPassword) {
      this.messaggioErrore = 'Le password non coincidono';
      return;
    }
    if (this.nuovaPassword.length < 8) {
      this.messaggioErrore = 'La password deve avere almeno 8 caratteri';
      return;
    }

    this.messaggioErrore = '';
    this.inCorso = true;

    this.auth.completaPrimoAccesso(this.email, this.nuovaPassword, this.session).subscribe({
      next: () => {
        this.auth.recuperaUtenteCorrente().subscribe({
          next: () => this.router.navigate(['/progetti']),
          error: () => {
            this.messaggioErrore = 'Password impostata ma impossibile recuperare i dati utente';
            this.inCorso = false;
          },
        });
      },
      error: () => {
        this.messaggioErrore = 'Sessione scaduta, riprova il login da capo';
        this.inCorso = false;
      },
    });
  }
}