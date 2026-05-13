import type { SheetMaterial } from "./library";

export type GrainDirection = "length" | "width" | "none";

export type EdgeKey = "front" | "back" | "left" | "right";

export interface PartEdges {
  front?: string;
  back?: string;
  left?: string;
  right?: string;
}

export interface Part {
  id: string;
  cabinetId: string;
  cabinetName: string;
  name: string;
  material: SheetMaterial;
  cutLength: number;
  cutWidth: number;
  cutThickness: number;
  grain: GrainDirection;
  size: [number, number, number];
  position: [number, number, number];
  quantity: number;
  edges: PartEdges;
}

export type DoorStyle = "none" | "single" | "double" | "drawerFront";
export type CabinetKind = "base" | "wall" | "tall";

export interface CabinetSpec {
  id: string;
  name: string;
  kind: CabinetKind;
  width: number;
  height: number;
  depth: number;
  toeKickHeight: number;
  toeKickSetback: number;
  panelMaterialId: string;
  backMaterialId: string;
  doorMaterialId: string;
  edgeBandingId: string;
  doorStyleId: string;
  hingeId: string;
  pullId: string;
  drawerSlideId: string | null;
  shelfCount: number;
  doorStyle: DoorStyle;
  doorGap: number;
  backInset: number;
  roomX: number;
  roomZ: number;
  roomRotation: number;
  roomY: number;
}

export interface Cabinet {
  spec: CabinetSpec;
  parts: Part[];
}

export interface Room {
  id: string;
  name: string;
  widthX: number;
  depthZ: number;
  cabinets: CabinetSpec[];
}

export interface CutlistRow {
  partName: string;
  materialName: string;
  length: number;
  width: number;
  thickness: number;
  grain: GrainDirection;
  quantity: number;
  edgeBandedMeters: number;
}
