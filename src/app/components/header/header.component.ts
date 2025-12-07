import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

// Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule, MatSlideToggleChange } from '@angular/material/slide-toggle';

// Transloco
import { TranslocoService } from '@jsverse/transloco';

// Auth Service (für Login/Logout Button Logik, optional)
import { AuthService } from '../../service/auth.service';

import { ThemeService } from '../../service/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  private translocoService = inject(TranslocoService);
  public auth = inject(AuthService); // Public für HTML Zugriff

  themeService = inject(ThemeService);

  isGerman = signal(false);

  ngOnInit() {
    // Sprache prüfen
    const activeLang = this.translocoService.getActiveLang();
    this.isGerman.set(activeLang === 'de');
  }

  onLanguageChange(event: MatSlideToggleChange) {
    const newLang = event.checked ? 'de' : 'en';
    this.translocoService.setActiveLang(newLang);
    this.isGerman.set(event.checked);
  }
}
