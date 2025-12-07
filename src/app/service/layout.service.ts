import { Injectable, signal } from '@angular/core';
import { Breadcrumb } from '../components/breadcrumbs/breadcrumbs.component';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  // Das Signal, das die Breadcrumbs-Komponente konsumiert
  breadcrumbs = signal<Breadcrumb[]>([]);

  // Methode 1: Für die Galerie (existiert wahrscheinlich schon)
  setBreadcrumbsFromPath(path: string) {
    const items: Breadcrumb[] = [{ label: 'Home', url: '/home' }];

    if (path) {
      const parts = path.split('/');
      let currentPath = '';

      parts.forEach((part) => {
        if (!part) return;
        currentPath += (currentPath ? '/' : '') + part;
        items.push({
          label: part.replace(/_/g, ' '),
          url: '/gallery',
          queryParams: { path: currentPath },
        });
      });
    } else {
      // Wenn wir in der Root-Galerie sind
      items.push({ label: 'Galerie', url: '/gallery' });
    }

    this.breadcrumbs.set(items);
  }

  // --- NEU: Methode 2 für statische Seiten ---
  setBreadcrumbs(items: Breadcrumb[]) {
    this.breadcrumbs.set(items);
  }
}
