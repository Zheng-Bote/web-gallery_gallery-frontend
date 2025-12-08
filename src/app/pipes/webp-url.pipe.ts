import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'webpUrl',
  standalone: true,
})
export class WebpUrlPipe implements PipeTransform {
  // Die Breiten, die unser C++ Backend generiert
  private readonly widths = [480, 680, 800, 1024, 1280];

  /**
   * @param originalUrl Die volle URL zum Originalbild (z.B. http://.../media/2025/img.jpg)
   * @param mode 'thumbnail' (einzelnes kleines Bild) oder 'srcset' (Liste aller Größen)
   */
  transform(originalUrl: string | undefined, mode: 'thumbnail' | 'srcset' = 'srcset'): string {
    if (!originalUrl) return '';

    // Wir gehen davon aus, dass nur Bilder verarbeitet werden
    // Extrahiere Pfad und Dateinamen
    const lastSlashIndex = originalUrl.lastIndexOf('/');
    if (lastSlashIndex === -1) return originalUrl;

    const basePath = originalUrl.substring(0, lastSlashIndex); // ".../media/2025"
    const fileName = originalUrl.substring(lastSlashIndex + 1); // "img.jpg"

    // Extension entfernen ("img.jpg" -> "img")
    const dotIndex = fileName.lastIndexOf('.');
    if (dotIndex === -1) return originalUrl;
    const baseName = fileName.substring(0, dotIndex);

    // Pfad zum webp Unterordner
    const webpBasePath = `${basePath}/webp`;

    if (mode === 'thumbnail') {
      // Für das Grid nehmen wir fix die kleinste Größe (480w)
      return `${webpBasePath}/${baseName}_480.webp`;
    }

    if (mode === 'srcset') {
      // Für den Viewer bauen wir den srcset String
      // Format: "url1 480w, url2 680w, ..."
      return this.widths
        .map((w) => {
          return `${webpBasePath}/${baseName}_${w}.webp ${w}w`;
        })
        .join(', ');
    }

    return originalUrl;
  }
}
