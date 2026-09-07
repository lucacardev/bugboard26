import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Notifica } from '../models/notifica.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getNotifiche() {
    return this.http.get<Notifica[]>(`${this.apiUrl}/notifiche`, { withCredentials: true });
  }

  segnaComeLetta(id: number) {
    return this.http.patch<Notifica>(`${this.apiUrl}/notifiche/${id}/letta`, {}, { withCredentials: true });
  }
}