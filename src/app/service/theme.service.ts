import { Injectable, signal, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private document = inject(DOCUMENT);

  // Signal: Liest aus LocalStorage oder nimmt 'false' (Standard Light)
  isDarkMode = signal<boolean>(localStorage.getItem('darkMode') === 'true');

  constructor() {
    // Effect: Reagiert automatisch, wenn sich das Signal ändert
    effect(() => {
      const isDark = this.isDarkMode();

      // 1. LocalStorage updaten
      localStorage.setItem('darkMode', String(isDark));

      // 2. CSS Klasse auf den Body setzen oder entfernen
      if (isDark) {
        this.document.body.classList.add('dark-theme');
      } else {
        this.document.body.classList.remove('dark-theme');
      }
    });
  }

  toggle() {
    this.isDarkMode.update((current) => !current);
  }
}
