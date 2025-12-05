import { Injectable } from '@angular/core';
import { Observable, of, interval } from 'rxjs'; // Für Async-Simulation
import { LocationNode } from './navigation.model';
import { map, take, finalize } from 'rxjs/operators';

export interface GalleryItem {
  name: string;
  type: 'folder' | 'image';
  path: string; // Der volle Pfad für Links
  url?: string; // Nur für Bilder: Die echte URL zum Anzeigen
}

@Injectable({
  providedIn: 'root',
})
export class GalleryService {
  // Mock-Funktion: Gibt die Ordnerstruktur zurück
  getFolderStructure(): Observable<LocationNode[]> {
    const DATA: LocationNode[] = [
      {
        name: 'Africa',
        path: 'Africa',
        children: [
          {
            name: 'Namibia',
            path: 'Africa/Namibia',
            children: [
              {
                name: 'Erongo',
                path: 'Africa/Namibia/Erongo',
                children: [{ name: 'Swakopmund', path: 'Africa/Namibia/Erongo/Swakopmund' }],
              },
            ],
          },
        ],
      },
      {
        name: 'Europe',
        path: 'Europe',
        children: [
          {
            name: 'Germany',
            path: 'Europe/Germany',
            children: [
              { name: 'Bavaria', path: 'Europe/Germany/Bavaria' }, // etc.
            ],
          },
        ],
      },
    ];
    return of(DATA); // Gibt ein Observable zurück
  }

  /**
   * Simuliert das Laden von Inhalten eines Ordners.
   * Später ersetzt du das durch this.http.get<GalleryItem[]>('/api/gallery?path=' + path)
   */
  getDirectoryContent(path: string): Observable<GalleryItem[]> {
    console.log('Lade Inhalt für:', path);

    // MOCK DATEN - Nur zum Testen der Navigation
    let items: GalleryItem[] = [];

    if (!path || path === '/') {
      // Root Ebene: Zeige Kontinente als Ordner
      items = [
        { name: 'Africa', type: 'folder', path: 'Africa' },
        { name: 'Europe', type: 'folder', path: 'Europe' },
      ];
    } else if (path === 'Africa') {
      items = [{ name: 'Namibia', type: 'folder', path: 'Africa/Namibia' }];
    } else if (path.includes('Namibia')) {
      // Wir sind tief drin, zeige ein paar Fake-Bilder
      items = [
        {
          name: 'Elefant.jpg',
          type: 'image',
          path: path,
          url: 'https://via.placeholder.com/300?text=Elefant',
        },
        {
          name: 'Wueste.jpg',
          type: 'image',
          path: path,
          url: 'https://via.placeholder.com/300?text=Dune',
        },
      ];
    } else {
      // Fallback
      items = [{ name: 'Leerer Ordner', type: 'folder', path: 'nichts' }];
    }

    // Kleines Delay simulieren (wie echte Netzwerk-Request)
    return of(items);
  }

  /**
   * Simuliert einen Datei-Upload mit Fortschritts-Events.
   * Gibt Zahlen von 0 bis 100 zurück.
   */
  uploadFile(file: File): Observable<number> {
    // Mock: Wir nutzen ein Interval, um den Upload zu faken
    // In der Realität: HttpClient mit reportProgress: true
    const speed = 50; // ms pro Tick
    const steps = 20; // 20 * 5 = 100%

    return interval(speed).pipe(
      take(steps + 1),
      map((i) => Math.round((i / steps) * 100))
    );
  }
}
