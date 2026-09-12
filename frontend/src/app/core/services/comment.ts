import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Commento } from '../models/commento.model';

@Injectable({
  providedIn: 'root'
})
export class CommentoService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getCommentiIssue(issueId: number) {
    return this.http.get<Commento[]>(`${this.apiUrl}/issues/${issueId}/commenti`, { withCredentials: true });
  }

  scriviCommento(issueId: number, testo: string) {
    return this.http.post<Commento>(`${this.apiUrl}/commenti`, { issueId, testo }, { withCredentials: true });
  }

  modificaCommento(id: number, testo: string) {
    return this.http.patch<Commento>(`${this.apiUrl}/commenti/${id}`, { testo }, { withCredentials: true });
  }

  eliminaCommento(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/commenti/${id}`, { withCredentials: true });
  }
}