import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';
import { AppLayout } from './shared/components/app-layout/app-layout';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
    canActivate: [guestGuard],
  },
  {
    path: 'completa-primo-accesso',
    loadComponent: () =>
      import('./features/auth/completa-primo-accesso/completa-primo-accesso').then(
        (m) => m.CompletaPrimoAccesso
      ),
    canActivate: [guestGuard],
  },
  {
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'progetti', pathMatch: 'full' },
      {
        path: 'progetti',
        loadComponent: () => import('./features/progetti/progetti-list/progetti-list').then((m) => m.ProgettiList),
      },
    ],
  },
];