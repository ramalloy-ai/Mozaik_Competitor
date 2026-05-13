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
export type CabinetKind =
  | "base"
  | "wall"
  | "tall"
  | "drawerBase"
  | "sinkBase"
  | "cornerBase";

// Joinery between carcass parts. Each value either butts against the
// receiving panel ("butt") or fits into a dado/rabbet machined into the
// receiving panel; the inset piece gains 2 * grooveDepth on the impacted
// axis so the panel's shoulders meet the outer faces of the carcass.
export type CarcassJoint = "butt" | "dado";
export type BackJoint = "surface" | "rabbet" | "dado";

export interface JoineryConfig {
  topBottomToSides: CarcassJoint;
  backToCarcass: BackJoint;
  grooveDepth: number; // mm, used for both dado and rabbet
}

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
  joinery: JoineryConfig;
  // For tall cabinets: fraction of door height occupied by the upper door.
  // 0 disables the split (single full-height pair).
  tallUpperFraction: number;
  tallDoorMidGap: number;
  // Face frame: stiles (vertical) + rails (horizontal) added to the front.
  faceFrame: boolean;
  faceFrameStileWidth: number;
  faceFrameRailWidth: number;
  // Drawer base: number of drawer banks stacked vertically.
  drawerCount: number;
  // Corner base: length of the blind leg and width of the blind face.
  cornerDepth: number;
  blindWidth: number;
  roomX: number;
  roomZ: number;
  roomRotation: number;
  roomY: number;
}

export interface Cabinet {
  spec: CabinetSpec;
  parts: Part[];
}

export interface WallPoint {
  x: number;
  z: number;
}

export interface Room {
  id: string;
  name: string;
  widthX: number;
  depthZ: number;
  // Optional explicit wall outline. If empty/missing, a rectangle of
  // (widthX, depthZ) is implied.
  walls: WallPoint[];
  wallHeight: number;
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
