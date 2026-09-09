import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth';
import { LayoutService } from '../../../core/services/layout';
import { NotificationService } from '../../../core/services/notification';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
  auth = inject(AuthService);
  layout = inject(LayoutService);
  notificationService = inject(NotificationService);

  get isAdmin(): boolean {
    return this.auth.currentUser()?.ruolo === 'amministratore';
  }

  get isStakeholder(): boolean {
    return this.auth.currentUser()?.ruolo === 'stakeholder';
  }

  ngOnInit(): void {
    // La sidebar vive per l'intera sessione autenticata (dentro AppLayout):
    // è il punto naturale da cui caricare le notifiche una prima volta,
    // popolando lo stato condiviso usato anche da NotificheList.
    this.notificationService.caricaNotifiche();
  }
}
