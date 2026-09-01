import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Etichetta } from '../models/etichetta.model';

@Injectable({
  providedIn: 'root'
})
export class EtichettaService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getEtichetteProgetto(progettoId: number) {
    return this.http.get<Etichetta[]>(`${this.apiUrl}/progetti/${progettoId}/etichette`, { withCredentials: true });
  }

  getEtichetteIssue(issueId: number) {
    return this.http.get<Etichetta[]>(`${this.apiUrl}/issues/${issueId}/etichette`, { withCredentials: true });
  }

  creaEtichetta(testo: string, colore: string, progettoId: number) {
    return this.http.post<Etichetta>(`${this.apiUrl}/etichette`, { testo, colore, progettoId }, { withCredentials: true });
  }

  associaAIssue(issueId: number, etichettaId: number) {
    return this.http.post(`${this.apiUrl}/issues/${issueId}/etichette`, { etichettaId }, { withCredentials: true });
  }

  rimuoviDaIssue(issueId: number, etichettaId: number) {
    return this.http.delete(`${this.apiUrl}/issues/${issueId}/etichette/${etichettaId}`, { withCredentials: true });
  }
}