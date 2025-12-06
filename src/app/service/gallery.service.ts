import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
// Wichtig: Import aus dem Model, NICHT lokal definiert
import { GalleryItem } from '../models/photo.model';

@Injectable({
  providedIn: 'root',
})
export class GalleryService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private webUrl = environment.webUrl;

  // --- DIESE METHODE FEHLTE ---
  getSubFolders(path: string): Observable<GalleryItem[]> {
    // Ruft das Backend mit dem neuen Flag auf
    const url = `${this.apiUrl}/api/gallery?path=${encodeURIComponent(path)}&folders_only=true`;

    return this.http.get<any[]>(url).pipe(map((items) => items.map((item) => item as GalleryItem)));
  }
  // -----------------------------

  getDirectoryContent(path: string = '', page: number = 1): Observable<GalleryItem[]> {
    const url = `${this.apiUrl}/api/gallery?path=${encodeURIComponent(path)}&page=${page}`;

    return this.http.get<any[]>(url).pipe(
      map((items) => {
        return items.map((item) => {
          // URLs für Bilder absolut machen
          if (item.type === 'image' && item.url) {
            item.url = `${this.webUrl}${item.url}`;
          }
          return item as GalleryItem;
        });
      })
    );
  }

  uploadFile(file: File, path: string): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('path', path);

    const req = new HttpRequest('POST', `${this.apiUrl}/upload`, formData, {
      reportProgress: true,
    });

    return this.http.request(req);
  }
}
