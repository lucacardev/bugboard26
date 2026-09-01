import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { VoceCronologia } from '../models/cronologia.model';

@Injectable({
  providedIn: 'root'
})
export class CronologiaService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getCronologiaIssue(issueId: number) {
    return this.http.get<VoceCronologia[]>(`${this.apiUrl}/issues/${issueId}/cronologia`, { withCredentials: true });
  }
}