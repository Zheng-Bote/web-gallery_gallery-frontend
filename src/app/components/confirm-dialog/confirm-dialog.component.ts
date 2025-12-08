import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, TranslocoModule],
  template: `
    <div *transloco="let t">
      <h2 mat-dialog-title>{{ t('dialog.delete_title') }}</h2>

      <mat-dialog-content>
        <p [innerHTML]="t('dialog.delete_message', { name: data.name })"></p>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button [mat-dialog-close]="false">
          {{ t('dialog.cancel') }}
        </button>

        <button mat-flat-button color="warn" [mat-dialog-close]="true">
          {{ t('dialog.confirm') }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
})
export class ConfirmDialogComponent {
  // Daten empfangen ({ name: 'bild.jpg' })
  data = inject(MAT_DIALOG_DATA);
}
