import { Component, Input, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router'; // ActivatedRoute hinzu
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GalleryService } from '../../service/gallery.service';
import { GalleryItem } from '../../models/photo.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tree-node',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="node-row">
      <button mat-icon-button class="toggle-btn" (click)="toggleExpand($event)">
        <mat-icon>{{ isExpanded() ? 'expand_more' : 'chevron_right' }}</mat-icon>
      </button>

      <a
        [routerLink]="['/gallery']"
        [queryParams]="{ path: item.path }"
        routerLinkActive="active-link"
        [routerLinkActiveOptions]="{ exact: true }"
        class="node-link"
      >
        <mat-icon class="folder-icon">folder</mat-icon>
        <span class="label">{{ item.name }}</span>
      </a>
    </div>

    @if (isExpanded()) {
    <div class="children-container">
      @if (isLoading()) {
      <div class="loading-spinner">
        <mat-spinner diameter="16"></mat-spinner>
      </div>
      } @for (child of children(); track child.name) {
      <app-tree-node [item]="child"></app-tree-node>
      }
    </div>
    }
  `,
  styles: [
    `
      .node-row {
        display: flex;
        align-items: center;
        height: 36px;
        border-radius: 4px;
        transition: background 0.1s;
      }
      .node-row:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }

      .toggle-btn {
        width: 28px;
        height: 28px;
        line-height: 28px;
        color: #757575;
      }
      .toggle-btn mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .node-link {
        flex: 1;
        display: flex;
        align-items: center;
        text-decoration: none;
        color: inherit;
        overflow: hidden;
        white-space: nowrap;
        height: 100%;
        padding-right: 8px;
        cursor: pointer;
      }

      .folder-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        margin-right: 8px;
        color: #ffc107;
      }
      .label {
        font-size: 13px;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      /* Active Link Styling (Blau hinterlegt) */
      .active-link {
        background-color: #e3f2fd;
        color: #1976d2;
        font-weight: 500;
        border-radius: 0 4px 4px 0;
      }

      .children-container {
        margin-left: 14px;
        border-left: 1px solid #e0e0e0;
      }
      .loading-spinner {
        padding: 4px 0 4px 24px;
      }
    `,
  ],
})
export class TreeNodeComponent implements OnInit, OnDestroy {
  @Input({ required: true }) item!: GalleryItem;

  private galleryService = inject(GalleryService);
  private route = inject(ActivatedRoute); // FIX 2: Route injecten

  isExpanded = signal(false);
  isLoading = signal(false);
  children = signal<GalleryItem[]>([]);
  hasLoaded = signal(false);

  private routeSub?: Subscription;

  ngOnInit() {
    // FIX 2: Auf URL Änderungen lauschen (Sync Breadcrumbs -> Tree)
    this.routeSub = this.route.queryParams.subscribe((params) => {
      const activePath = params['path'] || '';
      this.checkAutoExpand(activePath);
    });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }

  // Prüft, ob dieser Knoten aufgeklappt werden muss, weil der aktive Pfad tiefer liegt
  private checkAutoExpand(activePath: string) {
    if (!this.item.path) return;

    // Logik: Wenn der aktive Pfad mit meinem Pfad beginnt UND länger ist
    // Beispiel: Mein Pfad="2025", Aktiv="2025/Urlaub" -> Ich muss aufklappen!
    // Wir hängen '/' an, um "2025" vs "20250" Verwechslungen zu vermeiden.
    const myPathWithSlash = this.item.path + '/';
    const isActivePathChild = activePath.startsWith(myPathWithSlash);

    // Wenn wir ein Parent des aktiven Pfads sind und noch zugeklappt sind -> Aufklappen!
    if (isActivePathChild && !this.isExpanded()) {
      this.isExpanded.set(true);
      if (!this.hasLoaded()) {
        this.loadChildren();
      }
    }
  }

  toggleExpand(event: Event) {
    event.stopPropagation();
    this.isExpanded.update((v) => !v);

    if (this.isExpanded() && !this.hasLoaded()) {
      this.loadChildren();
    }
  }

  loadChildren() {
    this.isLoading.set(true);
    this.galleryService.getSubFolders(this.item.path || '').subscribe({
      next: (data) => {
        const folders = data.filter((x) => x.type === 'folder');
        this.children.set(folders);
        this.isLoading.set(false);
        this.hasLoaded.set(true);

        // Nach dem Laden der Kinder: Prüfen ob wir eines der Kinder sofort aufklappen müssen
        // (Rekursiver Trigger durch erneuten Check des aktuellen Pfads)
        const currentPath = this.route.snapshot.queryParams['path'] || '';
        if (currentPath) {
          // Dies triggert zwar nicht die Kinder-Komponenten direkt (da sie erst rendern müssen),
          // aber da die Kinder in ngOnInit auf queryParams subscriben,
          // passiert das Aufklappen der nächsten Ebene automatisch beim Rendern!
        }
      },
      error: () => this.isLoading.set(false),
    });
  }
}
