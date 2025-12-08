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

export interface PhotoUpdateData {
  title: string;
  description: string;
  keywords: string[];
}

export interface GalleryResponse {
  data: Photo[];
  page: number;
}

export interface GalleryItem {
  id?: number; // Wichtig: Optional machen oder sicherstellen, dass es immer da ist
  name: string;
  type: 'image' | 'folder';
  path?: string;
  url?: string;

  // Metadaten
  date?: string;
  camera?: string;
  city?: string;
  country?: string;

  // NEUE FELDER
  title?: string;
  description?: string;
  copyright?: string;
  keywords?: string[]; // Wir wollen im Code ein Array haben

  // Technische Daten (optional, falls wir ISO noch anzeigen wollen)
  iso?: string;
  aperture?: string;
  exposure_time?: string;
}
