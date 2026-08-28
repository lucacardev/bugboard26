import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  sidebarAperta = signal(false);

  toggleSidebar(): void {
    this.sidebarAperta.update((aperta) => !aperta);
  }

  chiudiSidebar(): void {
    this.sidebarAperta.set(false);
  }
}