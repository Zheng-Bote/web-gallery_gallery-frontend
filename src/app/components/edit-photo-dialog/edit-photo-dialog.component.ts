import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips'; // Wichtig für Keywords
import { COMMA, ENTER } from '@angular/cdk/keycodes'; // Tasten zum Bestätigen

import { GalleryItem, PhotoUpdateData } from '../../models/photo.model';

@Component({
  selector: 'app-edit-photo-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
  ],
  templateUrl: './edit-photo-dialog.component.html',
  styleUrl: './edit-photo-dialog.component.css',
})
export class EditPhotoDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditPhotoDialogComponent>);

  // Wir bekommen das aktuelle Bild übergeben, um die Felder vorzubelegen
  data = inject<GalleryItem>(MAT_DIALOG_DATA);

  form: FormGroup;

  // Keyword Logik
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  keywords = signal<string[]>([]); // Aktuelle Liste der Keywords

  constructor() {
    this.form = this.fb.group({
      title: [this.data.name || ''], // Fallback auf Dateinamen
      description: [this.data.description || ''], // Falls du description im Model hast, sonst leer
    });

    // Keywords initialisieren (falls im Model vorhanden, sonst leer)
    if (this.data.keywords) {
      this.keywords.set([...this.data.keywords]);
    }
  }

  // --- Chip Logik (Hinzufügen) ---
  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.keywords.update((keys) => [...keys, value]);
    }
    event.chipInput!.clear(); // Input leeren
  }

  // --- Chip Logik (Entfernen) ---
  remove(keyword: string): void {
    this.keywords.update((keys) => keys.filter((k) => k !== keyword));
  }

  // --- Speichern ---
  save() {
    if (this.form.valid) {
      const result: PhotoUpdateData = {
        title: this.form.value.title,
        description: this.form.value.description,
        keywords: this.keywords(),
      };
      // Wir geben die Daten an den Aufrufer zurück
      this.dialogRef.close(result);
    }
  }
}
