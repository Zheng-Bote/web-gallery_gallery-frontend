import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

// Material Imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
//import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from './service/auth.service';
import { LayoutService } from './service/layout.service';

import { NavigationTreeComponent } from './components/navigation-tree/navigation-tree.component';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    //  MatListModule,
    MatIconModule,
    MatButtonModule,
    NavigationTreeComponent,
    BreadcrumbsComponent,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  auth = inject(AuthService);
  layout = inject(LayoutService);

  // Status des Menüs (für Mobile Toggle)
  opened = true;
}
