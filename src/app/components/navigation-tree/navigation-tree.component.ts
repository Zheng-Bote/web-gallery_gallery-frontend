import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryService } from '../../service/gallery.service';
import { GalleryItem } from '../../models/photo.model';
import { TreeNodeComponent } from './tree-node.component'; // Importiere die neue Komponente

@Component({
  selector: 'app-navigation-tree',
  standalone: true,
  imports: [CommonModule, TreeNodeComponent], // Wichtig: TreeNodeComponent hier registrieren
  templateUrl: './navigation-tree.component.html',
  styleUrl: './navigation-tree.component.css',
})
export class NavigationTreeComponent implements OnInit {
  private galleryService = inject(GalleryService);

  rootFolders = signal<GalleryItem[]>([]);

  ngOnInit() {
    // Lade die oberste Ebene (Root)
    this.galleryService.getSubFolders('').subscribe((data) => {
      const folders = data.filter((x) => x.type === 'folder');
      this.rootFolders.set(folders);
    });
  }
}
