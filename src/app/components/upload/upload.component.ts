import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Wichtig für [(ngModel)]
import { HttpEventType } from '@angular/common/http'; // Wichtig für Events

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { GalleryService } from '../../service/gallery.service';
import { NotificationService } from '../../service/notification.service';

// Limit in Bytes (50 MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatListModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css',
})
export class UploadComponent {
  private galleryService = inject(GalleryService);
  private notify = inject(NotificationService);

  // State
  files = signal<File[]>([]);
  targetPath = signal(''); // NEU: Zielpfad
  isUploading = signal(false);

  // Wir berechnen den Gesamtfortschritt etwas genauer
  progress = signal(0);
  currentFileIndex = signal(0);

  isDragOver = signal(false);

  // --- Drag & Drop (Bleibt gleich, gekürzt) ---
  onDragOver(event: DragEvent) {
    event.preventDefault();
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
    if (event.dataTransfer?.files) this.handleFiles(event.dataTransfer.files);
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) this.handleFiles(input.files);
  }

  private handleFiles(fileList: FileList) {
    const newFiles = Array.from(fileList);

    // Validierung
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    newFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(file.name);
      } else {
        validFiles.push(file);
      }
    });

    // Fehler anzeigen, falls Dateien zu groß sind
    if (invalidFiles.length > 0) {
      this.notify.error(`Folgende Dateien sind zu groß (>50MB): ${invalidFiles.join(', ')}`);
    }

    // Duplikate vermeiden (optional)
    this.files.update((current) => {
      const existingNames = new Set(current.map((f) => f.name));
      const uniqueNew = validFiles.filter((f) => !existingNames.has(f.name));
      return [...current, ...uniqueNew];
    });
  }

  removeFile(index: number) {
    this.files.update((current) => current.filter((_, i) => i !== index));
  }

  // --- Upload Logik (Optimiert) ---

  async uploadAll() {
    if (this.files().length === 0) return;

    this.isUploading.set(true);
    this.progress.set(0);
    this.currentFileIndex.set(0);

    const path = this.targetPath().trim(); // Pfad holen
    const totalFiles = this.files().length;

    // Sequentieller Upload (eins nach dem anderen), um den Server nicht zu überlasten
    for (let i = 0; i < totalFiles; i++) {
      this.currentFileIndex.set(i + 1);
      const file = this.files()[i];

      try {
        // Umwandlung in Promise, um auf Fertigstellung zu warten
        await new Promise<void>((resolve, reject) => {
          this.galleryService.uploadFile(file, path).subscribe({
            // uploadFile(file) -> uploadFile(file, path)
            next: (event) => {
              if (event.type === HttpEventType.UploadProgress && event.total) {
                // Fortschritt der aktuellen Datei berechnen
                const fileProgress = Math.round((100 * event.loaded) / event.total);

                // Gesamtfortschritt: (Bereits fertige Dateien * 100 + aktueller Fortschritt) / Gesamtanzahl
                const totalProgress = (i * 100 + fileProgress) / totalFiles;
                this.progress.set(totalProgress);
              } else if (event.type === HttpEventType.Response) {
                resolve(); // Datei fertig
              }
            },
            error: (err) => {
              console.error(`Fehler bei ${file.name}`, err);
              // Wir machen trotzdem weiter mit der nächsten Datei
              resolve();
            },
          });
        });
      } catch (e) {
        console.error(e);
      }
    }

    // Abschluss
    this.isUploading.set(false);
    this.files.set([]);
    this.progress.set(0);
    this.notify.success('Upload abgeschlossen!');
  }
}
