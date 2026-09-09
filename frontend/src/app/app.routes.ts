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
      {
        path: 'notifiche',
        loadComponent: () => import('./features/notifiche/notifiche-list/notifiche-list').then((m) => m.NotificheList),
      },
      {
        path: 'issue-assegnate',
        loadComponent: () => import('./features/issue-assegnate/issue-assegnate-list/issue-assegnate-list').then((m) => m.IssueAssegnateList),
      },
      {
        path: 'utenti/nuovo',
        loadComponent: () => import('./features/utenti/utente-nuovo/utente-nuovo').then((m) => m.UtenteNuovo),
      },
      {
        path: 'progetti/:progettoId/issues',
        loadComponent: () => import('./features/issues/issue-list/issue-list').then((m) => m.IssueList),
      },

      // 'nuova' deve precedere ':issueId' nell'array: essendo entrambe rotte
      // a un solo segmento in più rispetto a 'issues', Angular Router prova
      // i figli nell'ordine in cui compaiono e la prima che "matcha"
      // vince — un parametro come ':issueId' accetterebbe anche la stringa
      // letterale "nuova", quindi se venisse prima la intercetterebbe lui
      // e la rotta dedicata non sarebbe mai raggiunta.
      
      {
        path: 'progetti/:progettoId/issues/nuova',
        loadComponent: () => import('./features/issues/issue-nuova/issue-nuova').then((m) => m.IssueNuova),
      },
      {
        path: 'progetti/:progettoId/issues/:issueId',
        loadComponent: () => import('./features/issues/issue-detail/issue-detail').then((m) => m.IssueDetail),
      },
      {
        path: 'team/:teamId',
        loadComponent: () => import('./features/team/team-detail/team-detail').then((m) => m.TeamDetail),
      },
    ],
  },
];