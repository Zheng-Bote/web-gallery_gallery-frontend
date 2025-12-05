import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatTreeModule, MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FlatTreeControl } from '@angular/cdk/tree';

// Imports aus deiner Struktur
import { GalleryService } from '../../service/gallery.service';
import { LocationNode, FlatLocationNode } from '../../service/navigation.model';

@Component({
  selector: 'app-navigation-tree',
  standalone: true,
  imports: [MatTreeModule, MatIcon, MatButtonModule, RouterLink, RouterLinkActive],
  templateUrl: './navigation-tree.component.html',
  styleUrl: './navigation-tree.component.css',
})
export class NavigationTreeComponent implements OnInit {
  private galleryService = inject(GalleryService);

  // --- Tree Konfiguration ---

  private _transformer = (node: LocationNode, level: number): FlatLocationNode => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      path: node.path,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<FlatLocationNode>(
    (node) => node.level,
    (node) => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  // Helper für das HTML Template
  hasChild = (_: number, node: FlatLocationNode) => node.expandable;

  ngOnInit() {
    // Daten laden
    this.galleryService.getFolderStructure().subscribe((data) => {
      this.dataSource.data = data;
    });
  }
}
