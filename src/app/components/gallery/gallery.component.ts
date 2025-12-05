import { Component, inject, signal, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap, tap } from 'rxjs/operators';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner'; // Optional: Ladeindikator

import { GalleryService, GalleryItem } from '../../service/gallery.service';
import { LayoutService } from '../../service/layout.service'; // Dein LayoutService für Breadcrumbs

import { MatDialog } from '@angular/material/dialog';
import { PhotoViewerComponent } from '../photo-viewer/photo-viewer.component';

import { Clipboard } from '@angular/cdk/clipboard'; // Angular CDK Helper
import { NotificationService } from '../../service/notification.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [RouterLink, MatIcon, MatProgressSpinner, MatButtonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css',
})
export class GalleryComponent {
  private route = inject(ActivatedRoute);
  private galleryService = inject(GalleryService);
  private layoutService = inject(LayoutService); // Wichtig für Breadcrumbs
  private clipboard = inject(Clipboard);
  private notify = inject(NotificationService);
  private dialog = inject(MatDialog);

  // State für die aktuellen Items (Bilder/Ordner)
  items = signal<GalleryItem[]>([]);
  isLoading = signal<boolean>(false);

  // Wir holen uns den 'path' QueryParam als Observable
  // und reagieren darauf automatisch.
  constructor() {
    this.route.queryParams
      .pipe(
        map((params) => params['path'] || ''), // Wenn leer, dann Root
        tap((path) => {
          // 1. Breadcrumbs aktualisieren (über deinen LayoutService)
          // Wir nutzen die Funktion, die wir früher in GalleryComponent hatten,
          // jetzt aber idealerweise im LayoutService liegt.
          this.updateBreadcrumbs(path);

          // 2. Ladezustand setzen
          this.isLoading.set(true);
        }),
        // 3. Daten vom Service holen (switchMap bricht alte Requests ab, wenn man schnell klickt)
        switchMap((path) => this.galleryService.getDirectoryContent(path))
      )
      .subscribe({
        next: (data) => {
          this.items.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Fehler beim Laden', err);
          this.isLoading.set(false);
        },
      });
  }

  // Hilfsfunktion für den Titel im HTML
  getCurrentFolderName(): string {
    const path = this.route.snapshot.queryParams['path'];
    if (!path) return 'Übersicht';
    const parts = path.split('/');
    return parts[parts.length - 1].replace(/_/g, ' ');
  }

  copyLink() {
    // Holt die aktuelle Browser-URL
    const currentUrl = window.location.href;

    // Kopiert in Zwischenablage
    const success = this.clipboard.copy(currentUrl);

    if (success) {
      this.notify.info('Link in die Zwischenablage kopiert!');
    } else {
      this.notify.error('Konnte Link nicht kopieren.');
    }
  }

  // Diese Logik hattest du vorher, sie muss jetzt hier ausgeführt werden
  // damit der LayoutService (und damit die App.html) die Breadcrumbs kennt.
  private updateBreadcrumbs(fullPath: string) {
    // Hier rufst du die Logik auf, die wir gestern besprochen haben.
    // Am besten lagerst du die Logik "String -> Breadcrumb[]" in den LayoutService aus.
    // Beispiel:
    this.layoutService.setBreadcrumbsFromPath(fullPath);
  }

  openImage(clickedItem: GalleryItem) {
    // 1. Nur Bilder aus der aktuellen Liste filtern (keine Ordner im Viewer)
    const imagesOnly = this.items().filter((x) => x.type === 'image');

    // 2. Den Index des geklickten Bildes finden
    const index = imagesOnly.findIndex((x) => x.name === clickedItem.name);

    if (index === -1) return;

    // 3. Dialog öffnen
    this.dialog.open(PhotoViewerComponent, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '100%',
      width: '100%',
      panelClass: 'full-screen-modal', // CSS Helper für Fullscreen
      data: {
        images: imagesOnly,
        startIndex: index,
      },
    });
  }
}
