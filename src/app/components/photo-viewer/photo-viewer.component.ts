import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Importiere dein GalleryItem Interface
import { GalleryItem } from '../../service/gallery.service';

export interface PhotoViewerData {
  images: GalleryItem[];
  startIndex: number;
}

@Component({
  selector: 'app-photo-viewer',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './photo-viewer.component.html',
  styleUrl: './photo-viewer.component.css',
})
export class PhotoViewerComponent {
  // Injection der Daten, die vom Dialog übergeben wurden
  readonly data = inject<PhotoViewerData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<PhotoViewerComponent>);

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
