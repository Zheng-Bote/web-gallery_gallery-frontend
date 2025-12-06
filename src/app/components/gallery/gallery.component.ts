import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap, tap } from 'rxjs/operators';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';

import { GalleryService } from '../../service/gallery.service';
import { LayoutService } from '../../service/layout.service';
import { NotificationService } from '../../service/notification.service';
import { PhotoViewerComponent } from '../photo-viewer/photo-viewer.component';
import { GalleryItem } from '../../models/photo.model';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [RouterLink, MatIcon, MatProgressSpinner, MatButtonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css',
})
export class GalleryComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private galleryService = inject(GalleryService);
  private layoutService = inject(LayoutService);
  private clipboard = inject(Clipboard);
  private notify = inject(NotificationService);
  private dialog = inject(MatDialog);

  // Signals
  items = signal<GalleryItem[]>([]);
  isLoading = signal<boolean>(false);
  canShare = signal<boolean>(typeof navigator !== 'undefined' && !!navigator.share);

  // NEU: Wir merken uns den aktuellen Pfad reactive
  currentPath = signal<string>('');

  // NEU: Der Titel berechnet sich automatisch neu, wenn currentPath sich ändert
  folderTitle = computed(() => {
    const path = this.currentPath();
    if (!path) return 'Übersicht';
    const parts = path.split('/');
    // Letzten Teil nehmen und Unterstriche entfernen
    return parts[parts.length - 1].replace(/_/g, ' ');
  });

  ngOnInit() {
    this.route.queryParams
      .pipe(
        map((params) => params['path'] || ''),
        tap((path) => {
          // State updaten
          this.currentPath.set(path);
          this.isLoading.set(true);

          // Breadcrumbs via Service updaten
          this.layoutService.setBreadcrumbsFromPath(path);
        }),
        switchMap((path) => this.galleryService.getDirectoryContent(path))
      )
      .subscribe({
        next: (data) => {
          this.items.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Ladefehler:', err);
          this.notify.error('Konnte Ordnerinhalt nicht laden.');
          this.isLoading.set(false);
        },
      });
  }

  navigateUp() {
    const current = this.currentPath();
    if (!current) return;

    // Pfad splitten und letztes Element entfernen
    const parts = current.split('/');
    parts.pop();
    const parentPath = parts.join('/');

    // Navigieren
    this.router.navigate(['/gallery'], { queryParams: { path: parentPath } });
  }

  copyLink() {
    const success = this.clipboard.copy(window.location.href);
    if (success) this.notify.info('Link in die Zwischenablage kopiert!');
  }
  async shareNative() {
    if (!this.canShare()) return;

    try {
      await navigator.share({
        title: 'CrowQt Galerie',
        text: `Schau dir den Ordner "${this.folderTitle()}" an:`,
        url: window.location.href,
      });
      // Optional: Erfolgsmeldung, aber meist gibt das OS Feedback
    } catch (err) {
      // User hat Share-Dialog abgebrochen oder Fehler
      console.log('Teilen abgebrochen oder fehlgeschlagen', err);
    }
  }

  openImage(clickedItem: GalleryItem) {
    if (clickedItem.type !== 'image') return;

    const imagesOnly = this.items().filter((x) => x.type === 'image');
    const index = imagesOnly.findIndex((x) => x.name === clickedItem.name);

    if (index !== -1) {
      this.dialog.open(PhotoViewerComponent, {
        // --- GRÖSSE & POSITION ---
        width: '85vw', // 85% der Breite (etwas mehr als 80% sieht meist besser aus)
        height: '85vh', // 85% der Höhe
        maxWidth: '95vw', // Verhindert, dass es auf Ultrawide zu breit wird
        maxHeight: '95vh',

        // --- STYLING ---
        panelClass: 'photo-modal-panel', // Unsere Klasse für Schatten & Radius
        backdropClass: 'blur-backdrop', // Unsere Klasse für den Blur-Effekt

        // --- DATEN ---
        data: {
          images: imagesOnly,
          startIndex: index,
        },

        // --- VERHALTEN ---
        autoFocus: false, // Verhindert, dass der erste Button Fokus klaut
        restoreFocus: false,
      });
    }
  }
}
