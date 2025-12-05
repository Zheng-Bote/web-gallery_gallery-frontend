export interface LocationNode {
  name: string; // z.B. "Africa"
  path: string; // z.B. "Africa" oder "Africa/Namibia"
  children?: LocationNode[];
}

// Hilfs-Interface für den Angular Material Tree (interne Nutzung)
export interface FlatLocationNode {
  expandable: boolean;
  name: string;
  path: string;
  level: number;
}
