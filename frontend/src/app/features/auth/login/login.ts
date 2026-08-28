import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private router = inject(Router);
  private auth = inject(AuthService);

  email = '';
  password = '';
  messaggioErrore = signal('');
  inCorso = signal(false);

  accedi(): void {
    if (!this.email || !this.password) {
      this.messaggioErrore.set('Inserisci email e password');
      return;
    }

    this.messaggioErrore.set('');
    this.inCorso.set(true);

    this.auth.login(this.email, this.password).subscribe({
      next: (risultato) => {
        if (risultato.richiedeNuovaPassword) {
          this.router.navigate(['/completa-primo-accesso'], {
            state: { email: this.email, session: risultato.session },
          });
          return;
        }
        this.auth.recuperaUtenteCorrente().subscribe({
          next: () => this.router.navigate(['/progetti']),
          error: () => {
            this.messaggioErrore.set('Accesso riuscito ma impossibile recuperare i dati utente');
            this.inCorso.set(false);
          },
        });
      },
      error: () => {
        this.messaggioErrore.set('Email o password non corrette');
        this.inCorso.set(false);
      },
    });
  }
}