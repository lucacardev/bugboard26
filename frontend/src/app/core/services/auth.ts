import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Utente } from '../models/utente.model';

interface RispostaLogin {
  richiedeNuovaPassword: boolean;
  session?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = `${environment.apiUrl}/auth`;

  // Utente corrente — null finché recuperaUtenteCorrente() non ha risposto
  currentUser = signal<Utente | null>(null);

  /**
   * Il backend risponde impostando un cookie HttpOnly con l'accessToken:
   * qui non riceviamo né gestiamo mai il token direttamente, solo l'esito.
   */
  login(email: string, password: string) {
    return this.http.post<RispostaLogin>(
      `${this.apiUrl}/login`,
      { email, password },
      { withCredentials: true }
    );
  }

  completaPrimoAccesso(email: string, nuovaPassword: string, session: string) {
    return this.http.post<RispostaLogin>(
      `${this.apiUrl}/completa-primo-accesso`,
      { email, nuovaPassword, session },
      { withCredentials: true }
    );
  }

  /** Usato dopo login/completaPrimoAccesso, e anche dopo un refresh di pagina */
  recuperaUtenteCorrente() {
    return this.http.get<Utente>(`${this.apiUrl}/me`, { withCredentials: true }).pipe(
      tap((utente) => this.currentUser.set(utente))
    );
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => this.completaLogout(),
      error: () => this.completaLogout(), // logout locale comunque, anche se la chiamata fallisse
    });
  }

  private completaLogout(): void {
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}