import { Routes } from '@angular/router';
import { authGuard } from './service/auth.guard';

export const routes: Routes = [
  // WICHTIG: Leerer Pfad muss weiterleiten
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'upload',
    loadComponent: () =>
      import('./components/upload/upload.component').then((m) => m.UploadComponent),
    canActivate: [authGuard], // <--- HIER SCHÜTZEN WIR DIE ROUTE
  },
  {
    path: 'gallery',
    loadComponent: () =>
      import('./components/gallery/gallery.component').then((m) => m.GalleryComponent),
  },

  // Fallback für unbekannte URLs (Optional)
  { path: '**', redirectTo: 'login' },
];
