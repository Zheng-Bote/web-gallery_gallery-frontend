import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
  MatDialog,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop'; // Wichtig
import { map } from 'rxjs/operators';

import { GalleryItem } from '../../models/photo.model';
import { GalleryService } from '../../service/gallery.service'; // Service importieren
import { NotificationService } from '../../service/notification.service'; // Für Feedback
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../service/auth.service';
import { EditPhotoDialogComponent } from '../edit-photo-dialog/edit-photo-dialog.component';
import { PhotoUpdateData } from '../../models/photo.model';
import { WebpUrlPipe } from '../../pipes/webp-url.pipe';

export interface PhotoViewerData {
  images: GalleryItem[];
  startIndex: number;
}

@Component({
  selector: 'app-photo-viewer',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, WebpUrlPipe],
  templateUrl: './photo-viewer.component.html',
  styleUrl: './photo-viewer.component.css',
})
export class PhotoViewerComponent {
  private galleryService = inject(GalleryService);
  private notify = inject(NotificationService);
  public auth = inject(AuthService);
  private translocoService = inject(TranslocoService);

  // Injection der Daten, die vom Dialog übergeben wurden
  readonly data = inject<PhotoViewerData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<PhotoViewerComponent>);
  private dialog = inject(MatDialog);

  // Ein Signal, das automatisch auf Sprachänderungen reagiert
  currentLocale = toSignal(
    this.translocoService.langChanges$.pipe(map((lang) => (lang === 'de' ? 'de-DE' : 'en-US'))),
    { initialValue: this.translocoService.getActiveLang() === 'de' ? 'de-DE' : 'en-US' }
  );

  // Signal für den aktuellen Index
  currentIndex = signal(this.data.startIndex);

  // Computed Signal: Das aktuelle Bild-Objekt basierend auf Index
  currentImage = computed(() => this.data.images[this.currentIndex()]);

  // --- Navigation Logic ---

  next() {
    if (this.currentIndex() < this.data.images.length - 1) {
      this.currentIndex.update((i) => i + 1);
    }
  }

  prev() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update((i) => i - 1);
    }
  }

  close() {
    this.dialogRef.close();
  }

  editPhoto() {
    const img = this.currentImage();
    if (!img.id) return;

    // 1. Dialog öffnen
    const dialogRef = this.dialog.open(EditPhotoDialogComponent, {
      width: '500px',
      data: img, // Wir übergeben das aktuelle Bild-Objekt
    });

    // 2. Auf Ergebnis warten
    dialogRef.afterClosed().subscribe((result: PhotoUpdateData | undefined) => {
      if (result) {
        // 3. API Call
        this.galleryService.updatePhotoMetadata(img.id!, result).subscribe({
          next: () => {
            this.notify.success('Gespeichert!');

            // 4. Lokale Daten aktualisieren (damit man es sofort sieht)
            // Achtung: Wir müssen das galleryItem im Array mutieren oder ersetzen.
            // Da 'images' in data eine Referenz auf das Array im GalleryComponent ist,
            // aktualisiert sich die Galerie im Hintergrund oft mit.
            // Sauberer ist es, das Objekt hier zu patchen:

            img.name = result.title; // Titel update
            // img.keywords = result.keywords; // Falls im Interface
            // img.description = result.description;

            // Trigger UI update (Signal neu setzen wäre sauberer, aber Mutation geht oft bei Objekten)
          },
          error: (err) => {
            console.error(err);
            this.notify.error('Fehler beim Speichern.');
          },
        });
      }
    });
  }

  deleteImage() {
    const img = this.currentImage();
    if (!img.id) return;

    // 1. MatDialog statt window.confirm
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      // Wir übergeben den Namen für den Platzhalter {{name}}
      data: { name: img.name },
    });

    // 2. Warten auf Ergebnis (true oder false)
    confirmRef.afterClosed().subscribe((result) => {
      if (result === true) {
        // User hat "Löschen" geklickt -> API Call
        this.performDelete(img.id!); // Ausgelagert für Sauberkeit
      }
    });
  }
  // Die eigentliche Lösch-Logik
  private performDelete(id: number) {
    this.galleryService.deletePhoto(id).subscribe({
      next: () => {
        this.notify.success('Bild gelöscht.');
        this.dialogRef.close(id); // Viewer schließen & ID zurückgeben
      },
      error: (err) => {
        console.error(err);
        this.notify.error('Fehler beim Löschen.');
      },
    });
  }

  // --- Tastatur Events (Pfeiltasten & ESC) ---

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowRight':
        this.next();
        break;
      case 'ArrowLeft':
        this.prev();
        break;
      case 'Escape':
        this.close();
        break;
    }
  }
}
