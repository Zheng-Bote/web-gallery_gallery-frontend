import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  // Standard-Konfiguration
  private config = {
    duration: 3000, // 3 Sekunden sichtbar
    horizontalPosition: 'center' as const,
    verticalPosition: 'top' as const,
  };

  success(message: string) {
    this.snackBar.open(message, 'OK', {
      ...this.config,
      panelClass: ['toast-success'], // CSS Klasse für Grün
    });
  }

  error(message: string) {
    this.snackBar.open(message, 'X', {
      ...this.config,
      duration: 5000, // Fehler zeigen wir etwas länger
      panelClass: ['toast-error'],
    });
  }

  info(message: string) {
    this.snackBar.open(message, undefined, {
      ...this.config,
      panelClass: ['toast-info'],
    });
  }
}
