import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';

// Trick: Wir importieren die package.json direkt
import packageJson from '../../../../package.json';
// Hinweis: Der Pfad muss stimmen! (src/app/components/footer -> ../../../../)

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, MatToolbarModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  // Daten aus package.json
  author = signal(packageJson.author || 'Unbekannt');
  createYear = signal((packageJson as any).createYear || '2025');

  // Aktuelles Jahr dynamisch
  currentYear = signal(new Date().getFullYear());

  // Computed Text für die Anzeige (z.B. "2025" oder "2025-2026")
  copyrightText() {
    const start = this.createYear();
    const current = this.currentYear().toString();

    if (start === current) {
      return `${start} ${this.author()}`;
    } else {
      return `${start}-${current} ${this.author()}`;
    }
  }
}
