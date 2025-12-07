import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { TranslocoModule, provideTranslocoScope } from '@jsverse/transloco';
import packageJson from '../../../../package.json';

import { LayoutService } from '../../service/layout.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, MatCardModule, TranslocoModule],
  providers: [provideTranslocoScope({ scope: 'about', alias: 'about' })],
  template: `
    <div class="page-container" *transloco="let t; read: 'about'">
      <mat-card class="content-card">
        <mat-card-header>
          <mat-card-title>{{ t('title') }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>{{ t('desc') }}</p>
          <br />
          <p>
            <strong>{{ t('author') }}:</strong> {{ author() }}
          </p>
          <p>
            <strong>{{ t('version') }}:</strong> {{ version() }}
          </p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 40px 20px;
        display: flex;
        justify-content: center;
      }
      .content-card {
        max-width: 800px;
        width: 100%;
        padding: 20px;
      }
      p {
        line-height: 1.6;
        color: var(--mat-sys-on-surface);
      }
    `,
  ],
})
export class AboutComponent implements OnInit {
  private layoutService = inject(LayoutService); // Injecten {
  author = signal(packageJson.author || 'ZHENG Bote');
  version = signal(packageJson.version || '0.0.1');

  ngOnInit() {
    this.layoutService.setBreadcrumbs([
      { label: 'Home', url: '/home' },
      { label: 'About', url: '/about' },
    ]);
  }
}
