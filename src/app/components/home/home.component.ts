import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

// Transloco & Auth
import { TranslocoModule, provideTranslocoScope } from '@jsverse/transloco';
import { AuthService } from '../../service/auth.service';
import { LayoutService } from '../../service/layout.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    TranslocoModule, // Wichtig für HTML
  ],
  providers: [
    // Lädt assets/i18n/home/de.json nur wenn wir auf dieser Seite sind!
    provideTranslocoScope({ scope: 'home', alias: 'home' }),
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private layoutService = inject(LayoutService);
  public auth = inject(AuthService); // Damit wir prüfen können, ob eingeloggt

  ngOnInit() {
    // Entweder leer lassen (keine Breadcrumbs auf Startseite):
    this.layoutService.setBreadcrumbs([]);

    // ODER nur "Home" anzeigen:
    // this.layoutService.setBreadcrumbs([{ label: 'Home', url: '/home' }]);
  }
}
