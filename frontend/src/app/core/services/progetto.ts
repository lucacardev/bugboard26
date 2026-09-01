import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Progetto } from '../models/progetto.model';

@Injectable({
  providedIn: 'root'
})
export class ProgettoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/progetti`;

  getTuttiIProgetti() {
    return this.http.get<Progetto[]>(this.apiUrl, { withCredentials: true });
  }

  getProgettiUtente(utenteId: number) {
    return this.http.get<Progetto[]>(`${environment.apiUrl}/utenti/${utenteId}/progetti`, { withCredentials: true });
  }

  getProgetto(id: number) {
    return this.http.get<Progetto>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  creaProgetto(nome: string, descrizione: string, nomeTeam: string) {
    return this.http.post<Progetto>(this.apiUrl, { nome, descrizione, nomeTeam }, { withCredentials: true });
  }
}