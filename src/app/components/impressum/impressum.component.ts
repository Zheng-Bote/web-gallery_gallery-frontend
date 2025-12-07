import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { TranslocoModule, TranslocoService, provideTranslocoScope } from '@jsverse/transloco';
import { Subscription } from 'rxjs';
import { LayoutService } from '../../service/layout.service';

@Component({
  selector: 'app-impressum',
  standalone: true,
  imports: [CommonModule, MatCardModule, TranslocoModule],
  providers: [provideTranslocoScope({ scope: 'impressum', alias: 'impressum' })],
  templateUrl: './impressum.component.html', // Wir lagern HTML aus, weil es viel Text ist
  styleUrl: './impressum.component.css',
})
export class ImpressumComponent implements OnInit, OnDestroy {
  private layoutService = inject(LayoutService);
  private translocoService = inject(TranslocoService);

  // Signal für die Sprache
  isGerman = signal(true);
  private langSub?: Subscription;

  ngOnInit() {
    // Breadcrumbs setzen
    this.layoutService.setBreadcrumbs([
      { label: 'Home', url: '/home' },
      { label: 'Impressum', url: '/impressum' },
    ]);

    // 1. Initiale Sprache setzen
    this.checkLang(this.translocoService.getActiveLang());

    // 2. Auf Änderungen lauschen (falls User im Header umschaltet)
    this.langSub = this.translocoService.langChanges$.subscribe((lang) => {
      this.checkLang(lang);
    });
  }

  ngOnDestroy() {
    this.langSub?.unsubscribe();
  }

  private checkLang(lang: string) {
    this.isGerman.set(lang === 'de');
  }
}
