import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../service/notification.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notify = inject(NotificationService);

  // Token holen
  const token = localStorage.getItem('token');

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // --- HIER FANGEN WIR DEN FEHLER AB ---
      if (err.status === 401) {
        // Optional: Prüfen, ob es wirklich "token expired" ist
        // (Dein Backend sendet: {"error": "...", "details": "token expired"})
        const isExpired =
          err.error?.details?.includes('token expired') ||
          err.error?.error?.includes('Token verification failed');

        if (isExpired || err.status === 401) {
          // 1. Storage aufräumen (Token wegwerfen)
          localStorage.removeItem('token');
          localStorage.removeItem('username');

          // 2. User informieren (damit er sich nicht wundert)
          notify.error('Sitzung abgelaufen. Bitte neu einloggen.');

          // 3. Zum Login umleiten
          router.navigate(['/login']);
        }
      }

      // Fehler weiterwerfen, damit die Komponente (z.B. Ladebalken beenden) Bescheid weiß
      return throwError(() => err);
    })
  );
};
