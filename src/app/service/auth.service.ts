import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, Observable } from 'rxjs';
import { LoginResponse } from '../models/auth.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

  // Signals
  accessToken = signal<string | null>(localStorage.getItem('token'));
  username = signal<string | null>(localStorage.getItem('username'));

  // Update: Wir geben das Observable direkt zurück, damit die Component den Fehler sieht
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap((response) => {
        // Nur bei Erfolg (200 OK) kommen wir hier rein
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('username', username);

        this.accessToken.set(response.token);
        this.username.set(username);
      })
    );
  }

  logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      this.http.post(`${this.apiUrl}/logout`, { refreshToken }).subscribe();
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');

    this.accessToken.set(null);
    this.username.set(null);

    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.accessToken();
  }
}
