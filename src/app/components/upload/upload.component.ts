import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';

import { GalleryService } from '../../service/gallery.service';
import { NotificationService } from '../../service/notification.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatListModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css',
})
export class UploadComponent {
  private galleryService = inject(GalleryService);
  private notify = inject(NotificationService);

  // State
  files = signal<File[]>([]);
  isUploading = signal(false);
  progress = signal(0);
  isDragOver = signal(false); // Für visuelles Feedback

  // --- Drag & Drop Events ---

  onDragOver(event: DragEvent) {
    event.preventDefault(); // Wichtig, sonst öffnet der Browser die Datei
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  // Fallback: Klick auf "Datei auswählen" Button
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(input.files);
    }
  }

  private handleFiles(fileList: FileList) {
    // FileList in echtes Array umwandeln und zum Signal hinzufügen
    const newFiles = Array.from(fileList);
    // Optional: Hier Duplikate filtern
    this.files.update((current) => [...current, ...newFiles]);
  }

  removeFile(index: number) {
    this.files.update((current) => current.filter((_, i) => i !== index));
  }

  // --- Upload Logik ---

  async uploadAll() {
    if (this.files().length === 0) return;

    this.isUploading.set(true);
    this.progress.set(0);

    // Wir laden hier simuliert eine Datei nach der anderen hoch
    // In echt könnte man Promise.all nutzen für parallele Uploads
    const totalFiles = this.files().length;
    let completed = 0;

    for (const file of this.files()) {
      // Mock Upload aufrufen
      // Wir wandeln das Observable in ein Promise um für einfaches async/await
      await new Promise<void>((resolve) => {
        this.galleryService.uploadFile(file).subscribe({
          next: (p) => {
            // Berechne Gesamtfortschritt (grob)
            const singleFilePart = 100 / totalFiles;
            const currentTotal = completed * singleFilePart + (p / 100) * singleFilePart;
            this.progress.set(currentTotal);
          },
          complete: () => {
            completed++;
            resolve();
          },
        });
      });
    }

    // Fertig
    this.isUploading.set(false);
    this.files.set([]); // Liste leeren
    this.progress.set(0);
    this.notify.success('Alle Bilder wurden erfolgreich hochgeladen!');
  }
}
