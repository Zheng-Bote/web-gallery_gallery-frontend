import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Wenn eingeloggt -> Tür auf
  if (auth.isLoggedIn()) {
    return true;
  }

  // Wenn nicht -> Umleiten zum Login
  return router.createUrlTree(['/login']);
};
