import { Injectable, signal, WritableSignal } from '@angular/core';

// Das Interface für einen Breadcrumb
export interface Breadcrumb {
  label: string;
  url: string | any[];
  queryParams?: Record<string, any>;
}

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  // Das Signal, das von app.html gelesen wird
  // Initialwert: Nur "Photos" (Root)
  breadcrumbs: WritableSignal<Breadcrumb[]> = signal<Breadcrumb[]>([
    { label: 'Photos', url: ['/gallery'], queryParams: { path: '' } },
  ]);

  /**
   * Erstellt die Breadcrumbs basierend auf einem Pfad-String.
   * Beispiel Input: "Africa/Namibia/Erongo"
   */
  setBreadcrumbsFromPath(fullPath: string) {
    // 1. Immer mit dem Root-Element starten
    const crumbs: Breadcrumb[] = [
      {
        label: 'Photos',
        url: ['/gallery'],
        queryParams: { path: '' },
      },
    ];

    // 2. Pfad zerlegen und aufbauen
    if (fullPath) {
      const parts = fullPath.split('/');
      let pathAccumulator = '';

      parts.forEach((part) => {
        // Leere Teile überspringen (falls String mit / beginnt)
        if (!part) return;

        // Pfad akkumulieren: "Africa" -> "Africa/Namibia"
        pathAccumulator += (pathAccumulator ? '/' : '') + part;

        crumbs.push({
          label: part.replace(/_/g, ' '), // Optik: "South_Africa" -> "South Africa"
          url: ['/gallery'], // Ziel ist immer die Gallery-Seite
          queryParams: { path: pathAccumulator }, // Der Parameter bestimmt den Ordner
        });
      });
    }

    // 3. Signal updaten -> Löst UI-Update in app.html aus
    this.breadcrumbs.set(crumbs);
  }
}
