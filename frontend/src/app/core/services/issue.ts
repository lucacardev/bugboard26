import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Issue, TipoIssue, StatoIssue } from '../models/issue.model';

export interface FiltriIssue {
  tipo?: TipoIssue;
  stato?: StatoIssue;
  assegnatarioId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class IssueService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;

  getIssueDelProgetto(progettoId: number, filtri: FiltriIssue = {}) {
    let params = new HttpParams();
    if (filtri.tipo) params = params.set('tipo', filtri.tipo);
    if (filtri.stato) params = params.set('stato', filtri.stato);
    if (filtri.assegnatarioId) params = params.set('assegnatarioId', filtri.assegnatarioId);

    return this.http.get<Issue[]>(`${this.apiUrl}/progetti/${progettoId}/issues`, {
      params,
      withCredentials: true,
    });
  }

  cambiaStato(issueId: number, nuovoStato: StatoIssue) {
    return this.http.patch<Issue>(
      `${this.apiUrl}/issues/${issueId}/stato`,
      { stato: nuovoStato },
      { withCredentials: true }
    );
  }

  creaIssue(progettoId: number, dati: Partial<{
    titolo: string;
    descrizione: string;
    tipo: TipoIssue;
    priorita: string;
    dataInizio: string;
    dataScadenza: string;
  }>) {
    return this.http.post<Issue>(`${this.apiUrl}/issues`, { ...dati, progettoId }, { withCredentials: true });
  }
}