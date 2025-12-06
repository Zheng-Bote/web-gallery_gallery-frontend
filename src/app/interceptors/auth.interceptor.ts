import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // 1. Token aus dem Speicher holen
  const token = localStorage.getItem('token');

  // 2. Request klonen und Header setzen (wenn Token existiert)
  // WICHTIG: Original-Requests sind immutable (unveränderlich), daher clone()
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // 3. Request weiterschicken und auf Antwort lauschen
  return next(authReq).pipe(
    catchError((err) => {
      // Bonus: Automatische Weiterleitung bei 401 (Token abgelaufen/ungültig)
      if (err.status === 401) {
        // Optional: LocalStorage leeren
        localStorage.removeItem('token');
        localStorage.removeItem('username');

        // Zurück zum Login
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
