import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);

  // Signale für den State
  // Wir prüfen initial, ob was im LocalStorage steht
  accessToken = signal<string | null>(localStorage.getItem('token'));
  username = signal<string | null>(localStorage.getItem('user'));

  login(user: string, pass: string): boolean {
    // MOCK LOGIN: In echt hier HTTP Request
    if (user === 'admin' && pass === '1234') {
      // 1. State setzen
      const fakeToken = 'abc-123-token';
      this.accessToken.set(fakeToken);
      this.username.set(user);

      // 2. Persistieren
      localStorage.setItem('token', fakeToken);
      localStorage.setItem('user', user);

      // 3. Weiterleiten
      this.router.navigate(['/upload']);
      return true;
    }

    return false;
  }

  logout() {
    // 1. State leeren
    this.accessToken.set(null);
    this.username.set(null);

    // 2. Speicher leeren
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // 3. Zum Login oder Home
    this.router.navigate(['/login']);
  }

  // Helper für den Guard
  isLoggedIn(): boolean {
    return !!this.accessToken();
  }
}
