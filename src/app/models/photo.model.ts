export interface Photo {
  id: number;
  filename: string;
  url: string; // Der relative Pfad vom Server (z.B. "/media/2025/...")
  date: string; // ISO-String

  // Optionale Metadaten (kommen aus LEFT JOINs im C++ Backend)
  city?: string;
  country?: string;
  camera?: string; // Im C++ JSON als "camera" gemappt (aus Exif Model)
  iso?: string;
}

export interface GalleryResponse {
  data: Photo[];
  page: number;
}

export interface GalleryItem {
  name: string;
  type: 'image' | 'folder';
  path?: string; // Nur bei Ordnern wichtig (QueryParam)
  url?: string; // Nur bei Bildern wichtig (src)

  // Metadaten für den Viewer
  date?: string;
  iso?: string;
  aperture?: string;
  exposure_time?: string;
  camera?: string;
  city?: string;
  country?: string;
}
