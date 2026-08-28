import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Se currentUser è già popolato (navigazione successiva alla prima), niente chiamata di rete
  if (authService.isLoggedIn()) {
    return true;
  }

  // Altrimenti (es. refresh di pagina), proviamo a recuperare l'utente dal cookie già presente
  return authService.recuperaUtenteCorrente().pipe(
    map(() => true),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};