import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // Wichtig für Navigation
import { CommonModule } from '@angular/common'; // Für *ngIf und @if

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Deine Services (Pfad prüfen!)
import { AuthService } from '../../service/auth.service';
import { NotificationService } from '../../service/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  // 1. Dependency Injection via inject()
  private fb = inject(FormBuilder);
  public auth = inject(AuthService); // Public, damit HTML drauf zugreifen kann (falls nötig)
  private notify = inject(NotificationService);
  private router = inject(Router);

  // 2. Formular Definition
  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  // 3. Signals für UI-Status
  hidePassword = signal(true);
  isLoading = signal(false);

  // 4. Submit Logik
  onSubmit() {
    if (this.loginForm.valid) {
      // Ladezustand aktivieren
      this.isLoading.set(true);

      const { username, password } = this.loginForm.value;

      // Login Request
      this.auth.login(username!, password!).subscribe({
        next: () => {
          this.notify.success(`Willkommen zurück, ${username}!`);
          this.isLoading.set(false);
          this.router.navigate(['/gallery']);
        },
        error: (err: any) => {
          // Explizit 'any' oder 'HttpErrorResponse' nutzen
          console.error('Login error: ', err);
          this.isLoading.set(false);

          if (err.status === 401) {
            this.notify.error('Falscher Benutzername oder Passwort.');
          } else {
            this.notify.error('Server nicht erreichbar.');
          }
        },
      });
    }
  }
}
