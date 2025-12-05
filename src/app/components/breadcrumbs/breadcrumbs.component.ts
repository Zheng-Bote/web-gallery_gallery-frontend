import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

// Interface für die Struktur (kann auch ausgelagert werden)
export interface Breadcrumb {
  label: string;
  // url kann ein String oder ein Array sein (für RouterLink)
  url: string | any[];
  // NEU: Optionaler Parameter für ?path=...
  queryParams?: Record<string, any>;
}

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [RouterLink, MatIcon],
  templateUrl: './breadcrumbs.component.html',
  styleUrl: './breadcrumbs.component.css',
})
export class BreadcrumbsComponent {
  // Signal Input: Wir erwarten zwingend ein Array von Breadcrumbs
  items = input.required<Breadcrumb[]>();
}
