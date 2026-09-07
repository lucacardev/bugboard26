import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Utente } from '../models/utente.model';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getMembri(teamId: number) {
    return this.http.get<Utente[]>(`${this.apiUrl}/teams/${teamId}/membri`, { withCredentials: true });
  }

  aggiungiMembro(teamId: number, utenteId: number) {
    return this.http.post(`${this.apiUrl}/teams/${teamId}/membri`, { utenteId }, { withCredentials: true });
  }

  rimuoviMembro(teamId: number, utenteId: number) {
    return this.http.delete(`${this.apiUrl}/teams/${teamId}/membri/${utenteId}`, { withCredentials: true });
  }
}