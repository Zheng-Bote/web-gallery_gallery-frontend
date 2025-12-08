import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

// Wichtig: Import aus dem Model, NICHT lokal definiert
import { GalleryItem } from '../models/photo.model';
import { PhotoUpdateData } from '../models/photo.model';

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
          const galleryItem = item as GalleryItem;

          if (galleryItem.type === 'image' && galleryItem.url) {
            galleryItem.url = `${this.webUrl}${galleryItem.url}`;
          }

          // --- FIX: Keywords String -> Array umwandeln ---
          // Das Backend sendet "keywords_string": "A,B,C"
          if (item['keywords_string']) {
            galleryItem.keywords = (item['keywords_string'] as string)
              .split(',')
              .filter((k) => k.trim() !== '');
          } else {
            galleryItem.keywords = [];
          }

          return galleryItem;
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

  updatePhotoMetadata(id: number, data: PhotoUpdateData): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/api/gallery/${id}`, data);
  }

  deletePhoto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/gallery/${id}`);
  }
}
