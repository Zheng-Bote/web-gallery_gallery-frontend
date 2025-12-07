import { Routes } from '@angular/router';
import { authGuard } from './service/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./components/home/home.component').then((m) => m.HomeComponent),
  },

  {
    path: 'gallery',
    loadComponent: () =>
      import('./components/gallery/gallery.component').then((m) => m.GalleryComponent),
  },

  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'about',
    loadComponent: () => import('./components/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'impressum',
    loadComponent: () =>
      import('./components/impressum/impressum.component').then((m) => m.ImpressumComponent),
  },
  // protected routes
  {
    path: 'upload',
    loadComponent: () =>
      import('./components/upload/upload.component').then((m) => m.UploadComponent),
    canActivate: [authGuard], // <--- HIER SCHÜTZEN WIR DIE ROUTE
  },

  // Fallback)
  { path: '**', redirectTo: 'login' },
];
