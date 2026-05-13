export type GrainDirection = "length" | "width" | "none";

export interface Material {
  id: string;
  name: string;
  thickness: number;
  color: string;
  hasGrain: boolean;
}

export interface Part {
  id: string;
  name: string;
  material: Material;
  cutLength: number;
  cutWidth: number;
  cutThickness: number;
  grain: GrainDirection;
  size: [number, number, number];
  position: [number, number, number];
  quantity: number;
}

export type DoorStyle = "none" | "single" | "double" | "drawerFront";

export interface BaseCabinetSpec {
  id: string;
  width: number;
  height: number;
  depth: number;
  toeKickHeight: number;
  toeKickSetback: number;
  panelMaterialId: string;
  backMaterialId: string;
  doorMaterialId: string;
  shelfCount: number;
  doorStyle: DoorStyle;
  doorGap: number;
  backInset: number;
}

export interface Cabinet {
  spec: BaseCabinetSpec;
  parts: Part[];
}

export interface CutlistRow {
  partName: string;
  materialName: string;
  length: number;
  width: number;
  thickness: number;
  grain: GrainDirection;
  quantity: number;
}
