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
  pricePerSquareMeter: number;
  defaultMaterialId: string;
  defaultEdgeBandingId: string;
}

const SHEET = (
  id: string,
  name: string,
  thickness: number,
  color: string,
  hasGrain: boolean,
  price: number,
  kind: SheetMaterial["kind"],
): SheetMaterial => ({
  id,
  name,
  thickness,
  color,
  hasGrain,
  sheetLength: 2440,
  sheetWidth: 1220,
  pricePerSheet: price,
  kind,
});

export const SHEET_MATERIALS: Record<string, SheetMaterial> = {
  ply18Maple: SHEET("ply18Maple", '3/4" Maple Plywood', 18, "#d9b382", true, 89, "carcass"),
  ply18Birch: SHEET("ply18Birch", '3/4" Birch Plywood', 18, "#e0c79a", true, 78, "carcass"),
  ply18Oak: SHEET("ply18Oak", '3/4" White Oak Plywood', 18, "#c79b6b", true, 112, "carcass"),
  ply18Walnut: SHEET("ply18Walnut", '3/4" Walnut Plywood', 18, "#6b4a32", true, 168, "carcass"),
  mel18White: SHEET("mel18White", '3/4" White Melamine', 18, "#f4f4ef", false, 62, "carcass"),
  mel18Grey: SHEET("mel18Grey", '3/4" Light Grey Melamine', 18, "#c7c8c4", false, 64, "carcass"),
  mel18Black: SHEET("mel18Black", '3/4" Matte Black Melamine', 18, "#2b2c2e", false, 76, "carcass"),
  ply6Maple: SHEET("ply6Maple", '1/4" Maple Plywood', 6, "#caa472", true, 38, "back"),
  ply6Birch: SHEET("ply6Birch", '1/4" Birch Plywood', 6, "#d0b485", true, 35, "back"),
  hdf3: SHEET("hdf3", '1/8" White HDF Back', 3, "#f0ede4", false, 18, "back"),
  mdf18: SHEET("mdf18", '3/4" MDF (paint grade)', 18, "#bcb097", false, 54, "door"),
  mdf12: SHEET("mdf12", '1/2" MDF Drawer Sides', 12, "#bcb097", false, 38, "carcass"),
  thermofoilWhite: SHEET("thermofoilWhite", "Thermofoil Slab — White", 18, "#fafafa", false, 92, "door"),
  thermofoilGrey: SHEET("thermofoilGrey", "Thermofoil Slab — Driftwood", 18, "#a8a39c", false, 98, "door"),
  acrylic18Gloss: SHEET("acrylic18Gloss", "High-Gloss Acrylic", 18, "#eaeef2", false, 245, "door"),
};

export const EDGE_BANDINGS: Record<string, EdgeBandingProduct> = {
  pvc1mmMaple: { id: "pvc1mmMaple", name: "1mm PVC — Maple", thickness: 1, width: 22, color: "#d9b382", pricePerMeter: 0.55 },
  pvc1mmBirch: { id: "pvc1mmBirch", name: "1mm PVC — Birch", thickness: 1, width: 22, color: "#e0c79a", pricePerMeter: 0.5 },
  pvc1mmOak: { id: "pvc1mmOak", name: "1mm PVC — White Oak", thickness: 1, width: 22, color: "#c79b6b", pricePerMeter: 0.7 },
  pvc1mmWhite: { id: "pvc1mmWhite", name: "1mm PVC — White", thickness: 1, width: 22, color: "#f4f4ef", pricePerMeter: 0.45 },
  pvc1mmBlack: { id: "pvc1mmBlack", name: "1mm PVC — Matte Black", thickness: 1, width: 22, color: "#2b2c2e", pricePerMeter: 0.55 },
  pvc2mmWhite: { id: "pvc2mmWhite", name: "2mm PVC — White (heavy)", thickness: 2, width: 22, color: "#f4f4ef", pricePerMeter: 0.85 },
  veneer05Maple: { id: "veneer05Maple", name: "0.5mm Wood Veneer — Maple", thickness: 0.5, width: 22, color: "#d9b382", pricePerMeter: 0.95 },
  veneer05Walnut: { id: "veneer05Walnut", name: "0.5mm Wood Veneer — Walnut", thickness: 0.5, width: 22, color: "#6b4a32", pricePerMeter: 1.4 },
};

export const HINGES: Record<string, HingeProduct> = {
  blum110: { id: "blum110", name: "Blum CLIP top 110° Soft-Close", pricePerUnit: 4.5, openingAngle: 110 },
  blum120: { id: "blum120", name: "Blum CLIP top 120° Soft-Close", pricePerUnit: 5.2, openingAngle: 120 },
  blum155: { id: "blum155", name: "Blum CLIP top 155°", pricePerUnit: 6.4, openingAngle: 155 },
  blum170: { id: "blum170", name: "Blum CLIP top 170° Wide-Angle", pricePerUnit: 7.5, openingAngle: 170 },
  blumBlind: { id: "blumBlind", name: "Blum 95° Blind-Corner", pricePerUnit: 8.9, openingAngle: 95 },
  grass110: { id: "grass110", name: "Grass Tiomos 110° Soft-Close", pricePerUnit: 3.9, openingAngle: 110 },
  salice110: { id: "salice110", name: "Salice Series 200 110°", pricePerUnit: 4.1, openingAngle: 110 },
};

export const DRAWER_SLIDES: Record<string, DrawerSlideProduct> = {
  blumTandem400: { id: "blumTandem400", name: "Blum Tandem 400mm", lengthMm: 400, pricePerPair: 26, fullExtension: true },
  blumTandem450: { id: "blumTandem450", name: "Blum Tandem 450mm", lengthMm: 450, pricePerPair: 28, fullExtension: true },
  blumTandem500: { id: "blumTandem500", name: "Blum Tandem 500mm", lengthMm: 500, pricePerPair: 30, fullExtension: true },
  blumTandem550: { id: "blumTandem550", name: "Blum Tandem 550mm", lengthMm: 550, pricePerPair: 32, fullExtension: true },
  blumMovento450: { id: "blumMovento450", name: "Blum Movento 450mm (heavy)", lengthMm: 450, pricePerPair: 48, fullExtension: true },
  ksHettich450: { id: "ksHettich450", name: "Hettich Quadro V6 450mm", lengthMm: 450, pricePerPair: 22, fullExtension: true },
};

export const PULLS: Record<string, PullProduct> = {
  bar96: { id: "bar96", name: "Brushed Steel Bar — 96mm", pricePerUnit: 3.4, centersMm: 96 },
  bar128: { id: "bar128", name: "Brushed Steel Bar — 128mm", pricePerUnit: 4.0, centersMm: 128 },
  bar160: { id: "bar160", name: "Brushed Steel Bar — 160mm", pricePerUnit: 4.8, centersMm: 160 },
  bar192: { id: "bar192", name: "Brushed Steel Bar — 192mm", pricePerUnit: 5.5, centersMm: 192 },
  bar320: { id: "bar320", name: "Brushed Steel Bar — 320mm", pricePerUnit: 8.5, centersMm: 320 },
  knobMatteBlack: { id: "knobMatteBlack", name: "Matte Black Knob", pricePerUnit: 2.4, centersMm: 0 },
  cupBrass: { id: "cupBrass", name: "Aged Brass Cup Pull — 96mm", pricePerUnit: 6.9, centersMm: 96 },
  edge: { id: "edge", name: "Continuous Edge Pull (per cabinet)", pricePerUnit: 0, centersMm: 0 },
};

export const DOOR_STYLES: Record<string, DoorStyleDef> = {
  slab: { id: "slab", name: "Slab", pricePerSquareMeter: 120, defaultMaterialId: "mdf18", defaultEdgeBandingId: "pvc1mmWhite" },
  shaker: { id: "shaker", name: "Shaker", pricePerSquareMeter: 215, defaultMaterialId: "mdf18", defaultEdgeBandingId: "pvc1mmWhite" },
  shakerInset: { id: "shakerInset", name: "Shaker (Inset)", pricePerSquareMeter: 265, defaultMaterialId: "mdf18", defaultEdgeBandingId: "pvc1mmWhite" },
  flatPanelMaple: { id: "flatPanelMaple", name: "Flat Panel — Maple", pricePerSquareMeter: 180, defaultMaterialId: "ply18Maple", defaultEdgeBandingId: "pvc1mmMaple" },
  flatPanelOak: { id: "flatPanelOak", name: "Flat Panel — White Oak", pricePerSquareMeter: 240, defaultMaterialId: "ply18Oak", defaultEdgeBandingId: "pvc1mmOak" },
  flatPanelWalnut: { id: "flatPanelWalnut", name: "Flat Panel — Walnut", pricePerSquareMeter: 320, defaultMaterialId: "ply18Walnut", defaultEdgeBandingId: "veneer05Walnut" },
  raisedPanel: { id: "raisedPanel", name: "Raised Panel", pricePerSquareMeter: 295, defaultMaterialId: "ply18Maple", defaultEdgeBandingId: "pvc1mmMaple" },
  thermofoil: { id: "thermofoil", name: "Thermofoil Slab", pricePerSquareMeter: 145, defaultMaterialId: "thermofoilWhite", defaultEdgeBandingId: "pvc1mmWhite" },
  glass: { id: "glass", name: "Glass Panel (5-piece frame)", pricePerSquareMeter: 320, defaultMaterialId: "mdf18", defaultEdgeBandingId: "pvc1mmWhite" },
  acrylicGloss: { id: "acrylicGloss", name: "High-Gloss Acrylic", pricePerSquareMeter: 385, defaultMaterialId: "acrylic18Gloss", defaultEdgeBandingId: "pvc2mmWhite" },
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
