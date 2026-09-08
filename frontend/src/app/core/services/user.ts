import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Utente, RuoloUtente } from '../models/utente.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/utenti`;

  getTuttiGliUtenti() {
    return this.http.get<Utente[]>(this.apiUrl, { withCredentials: true });
  }

  creaUtente(username: string, email: string, ruolo: RuoloUtente) {
    return this.http.post<Utente>(this.apiUrl, { username, email, ruolo }, { withCredentials: true });
  }
}