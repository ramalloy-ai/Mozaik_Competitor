import type { CabinetSpec, Part } from "../types";
import { getMaterial } from "../library";

// Add face-frame parts (stiles + rails) to the front of a carcass. Returns
// the parts to append plus the inset distance the doors should be shifted
// (because the door now sits against the inside edge of the frame).
export function addFaceFrameParts(
  spec: CabinetSpec,
  carcassFrontY: { yBottom: number; yTop: number },
): { parts: Part[]; doorOffsetZ: number; doorInsetX: number; doorInsetY: { bot: number; top: number } } {
  if (!spec.faceFrame) {
    return {
      parts: [],
      doorOffsetZ: 0,
      doorInsetX: 0,
      doorInsetY: { bot: 0, top: 0 },
    };
  }
  const panel = getMaterial(spec.panelMaterialId);
  const t = panel.thickness;
  const edge = spec.edgeBandingId;
  const stileW = spec.faceFrameStileWidth;
  const railW = spec.faceFrameRailWidth;
  const W = spec.width;
  const D = spec.depth;
  const { yBottom, yTop } = carcassFrontY;
  const frameH = yTop - yBottom;
  const parts: Part[] = [];
  const push = (p: Omit<Part, "cabinetId" | "cabinetName">) =>
    parts.push({ ...p, cabinetId: spec.id, cabinetName: spec.name });

  // Stiles: full-height verticals on each side.
  push({
    id: `${spec.id}-ff-stile-l`,
    name: "Face Frame Stile (Left)",
    material: panel,
    cutLength: frameH,
    cutWidth: stileW,
    cutThickness: t,
    grain: "length",
    size: [stileW, frameH, t],
    position: [stileW / 2, yBottom + frameH / 2, D + t / 2],
    quantity: 1,
    edges: { front: edge, back: edge, left: edge, right: edge },
  });
  push({
    id: `${spec.id}-ff-stile-r`,
    name: "Face Frame Stile (Right)",
    material: panel,
    cutLength: frameH,
    cutWidth: stileW,
    cutThickness: t,
    grain: "length",
    size: [stileW, frameH, t],
    position: [W - stileW / 2, yBottom + frameH / 2, D + t / 2],
    quantity: 1,
    edges: { front: edge, back: edge, left: edge, right: edge },
  });
  // Rails: top and bottom horizontals between the stiles.
  const railLen = W - 2 * stileW;
  push({
    id: `${spec.id}-ff-rail-b`,
    name: "Face Frame Rail (Bottom)",
    material: panel,
    cutLength: railLen,
    cutWidth: railW,
    cutThickness: t,
    grain: "length",
    size: [railLen, railW, t],
    position: [W / 2, yBottom + railW / 2, D + t / 2],
    quantity: 1,
    edges: { front: edge, back: edge, left: edge, right: edge },
  });
  push({
    id: `${spec.id}-ff-rail-t`,
    name: "Face Frame Rail (Top)",
    material: panel,
    cutLength: railLen,
    cutWidth: railW,
    cutThickness: t,
    grain: "length",
    size: [railLen, railW, t],
    position: [W / 2, yTop - railW / 2, D + t / 2],
    quantity: 1,
    edges: { front: edge, back: edge, left: edge, right: edge },
  });

  return {
    parts,
    doorOffsetZ: t,
    doorInsetX: stileW,
    doorInsetY: { bot: railW, top: railW },
  };
}
