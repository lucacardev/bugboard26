import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Notifica } from '../models/notifica.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Stato condiviso: sia la Sidebar (per il bollino) sia NotificheList (per
  // la lista completa) leggono la stessa fonte di verità, così segnare una
  // notifica come letta aggiorna entrambe senza bisogno di rifare la fetch.
  private notificheSignal = signal<Notifica[]>([]);
  notifiche = this.notificheSignal.asReadonly();
  caricamento = signal(true);

  nonLette = computed(() => this.notificheSignal().filter((n) => !n.letta).length);

  caricaNotifiche(): void {
    this.http.get<Notifica[]>(`${this.apiUrl}/notifiche`, { withCredentials: true }).subscribe({
      next: (notifiche) => {
        this.notificheSignal.set(notifiche);
        this.caricamento.set(false);
      },
      error: () => this.caricamento.set(false),
    });
  }

  segnaComeLetta(id: number): void {
    this.http.patch<Notifica>(`${this.apiUrl}/notifiche/${id}/letta`, {}, { withCredentials: true }).subscribe({
      next: (notificaAggiornata) => {
        this.notificheSignal.update((lista) =>
          lista.map((n) => (n.id === notificaAggiornata.id ? notificaAggiornata : n))
        );
      },
    });
  }
}
