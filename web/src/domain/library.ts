export interface SheetMaterial {
  id: string;
  name: string;
  thickness: number;
  color: string;
  hasGrain: boolean;
  sheetLength: number;
  sheetWidth: number;
  pricePerSheet: number;
  kind: "carcass" | "door" | "back";
}

export interface EdgeBandingProduct {
  id: string;
  name: string;
  thickness: number;
  width: number;
  color: string;
  pricePerMeter: number;
}

export interface HingeProduct {
  id: string;
  name: string;
  pricePerUnit: number;
  openingAngle: number;
}

export interface DrawerSlideProduct {
  id: string;
  name: string;
  lengthMm: number;
  pricePerPair: number;
  fullExtension: boolean;
}

export interface PullProduct {
  id: string;
  name: string;
  pricePerUnit: number;
  centersMm: number;
}

export interface DoorStyleDef {
  id: string;
  name: string;
  // For now style only affects appearance + price; future: panel construction.
  pricePerSquareMeter: number;
  defaultMaterialId: string;
  defaultEdgeBandingId: string;
}

export const SHEET_MATERIALS: Record<string, SheetMaterial> = {
  ply18: {
    id: "ply18",
    name: '3/4" Maple Plywood',
    thickness: 18,
    color: "#d9b382",
    hasGrain: true,
    sheetLength: 2440,
    sheetWidth: 1220,
    pricePerSheet: 89.0,
    kind: "carcass",
  },
  mel18: {
    id: "mel18",
    name: '3/4" White Melamine',
    thickness: 18,
    color: "#f4f4ef",
    hasGrain: false,
    sheetLength: 2440,
    sheetWidth: 1220,
    pricePerSheet: 62.0,
    kind: "carcass",
  },
  ply6: {
    id: "ply6",
    name: '1/4" Maple Plywood',
    thickness: 6,
    color: "#caa472",
    hasGrain: true,
    sheetLength: 2440,
    sheetWidth: 1220,
    pricePerSheet: 38.0,
    kind: "back",
  },
  hdf3: {
    id: "hdf3",
    name: "1/8\" HDF Back",
    thickness: 3,
    color: "#caa472",
    hasGrain: false,
    sheetLength: 2440,
    sheetWidth: 1220,
    pricePerSheet: 18.0,
    kind: "back",
  },
  mdf18: {
    id: "mdf18",
    name: '3/4" MDF (paint grade)',
    thickness: 18,
    color: "#bcb097",
    hasGrain: false,
    sheetLength: 2440,
    sheetWidth: 1220,
    pricePerSheet: 54.0,
    kind: "door",
  },
};

export const EDGE_BANDINGS: Record<string, EdgeBandingProduct> = {
  pvc1mmMaple: {
    id: "pvc1mmMaple",
    name: "1mm PVC Maple",
    thickness: 1,
    width: 22,
    color: "#d9b382",
    pricePerMeter: 0.55,
  },
  pvc1mmWhite: {
    id: "pvc1mmWhite",
    name: "1mm PVC White",
    thickness: 1,
    width: 22,
    color: "#f4f4ef",
    pricePerMeter: 0.45,
  },
  veneer05Maple: {
    id: "veneer05Maple",
    name: "0.5mm Veneer Maple",
    thickness: 0.5,
    width: 22,
    color: "#d9b382",
    pricePerMeter: 0.95,
  },
};

export const HINGES: Record<string, HingeProduct> = {
  blum110: {
    id: "blum110",
    name: "Blum 110° Soft-Close",
    pricePerUnit: 4.5,
    openingAngle: 110,
  },
  blum170: {
    id: "blum170",
    name: "Blum 170° Soft-Close",
    pricePerUnit: 7.5,
    openingAngle: 170,
  },
};

export const DRAWER_SLIDES: Record<string, DrawerSlideProduct> = {
  blumTandem450: {
    id: "blumTandem450",
    name: "Blum Tandem 450mm",
    lengthMm: 450,
    pricePerPair: 28.0,
    fullExtension: true,
  },
  blumTandem550: {
    id: "blumTandem550",
    name: "Blum Tandem 550mm",
    lengthMm: 550,
    pricePerPair: 32.0,
    fullExtension: true,
  },
};

export const PULLS: Record<string, PullProduct> = {
  bar128: {
    id: "bar128",
    name: "Brushed Steel Bar 128mm",
    pricePerUnit: 4.0,
    centersMm: 128,
  },
  bar192: {
    id: "bar192",
    name: "Brushed Steel Bar 192mm",
    pricePerUnit: 5.5,
    centersMm: 192,
  },
};

export const DOOR_STYLES: Record<string, DoorStyleDef> = {
  slab: {
    id: "slab",
    name: "Slab",
    pricePerSquareMeter: 120,
    defaultMaterialId: "mdf18",
    defaultEdgeBandingId: "pvc1mmWhite",
  },
  shaker: {
    id: "shaker",
    name: "Shaker",
    pricePerSquareMeter: 215,
    defaultMaterialId: "mdf18",
    defaultEdgeBandingId: "pvc1mmWhite",
  },
  flatPanelMaple: {
    id: "flatPanelMaple",
    name: "Flat Panel Maple",
    pricePerSquareMeter: 180,
    defaultMaterialId: "ply18",
    defaultEdgeBandingId: "pvc1mmMaple",
  },
};

export function getMaterial(id: string): SheetMaterial {
  const m = SHEET_MATERIALS[id];
  if (!m) throw new Error(`Unknown material: ${id}`);
  return m;
}

export function getEdgeBanding(id: string): EdgeBandingProduct {
  const e = EDGE_BANDINGS[id];
  if (!e) throw new Error(`Unknown edge banding: ${id}`);
  return e;
}

export function getHinge(id: string): HingeProduct {
  const h = HINGES[id];
  if (!h) throw new Error(`Unknown hinge: ${id}`);
  return h;
}

export function getDrawerSlide(id: string): DrawerSlideProduct {
  const s = DRAWER_SLIDES[id];
  if (!s) throw new Error(`Unknown drawer slide: ${id}`);
  return s;
}

export function getPull(id: string): PullProduct {
  const p = PULLS[id];
  if (!p) throw new Error(`Unknown pull: ${id}`);
  return p;
}

export function getDoorStyle(id: string): DoorStyleDef {
  const d = DOOR_STYLES[id];
  if (!d) throw new Error(`Unknown door style: ${id}`);
  return d;
}
