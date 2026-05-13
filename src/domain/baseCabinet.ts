import type { BaseCabinetSpec, Cabinet, Part } from "./types";
import { getMaterial } from "./materials";

// Coordinate system (millimeters):
//   +X right, +Y up, +Z forward (toward viewer / out of cabinet front)
//   Cabinet origin = back-bottom-left corner of carcass (excluding doors).
//   Doors hang on the +Z face.

export function buildBaseCabinet(spec: BaseCabinetSpec): Cabinet {
  const panel = getMaterial(spec.panelMaterialId);
  const back = getMaterial(spec.backMaterialId);
  const door = getMaterial(spec.doorMaterialId);

  const t = panel.thickness;
  const tb = back.thickness;
  const td = door.thickness;
  const W = spec.width;
  const H = spec.height;
  const D = spec.depth;
  const tk = spec.toeKickHeight;
  const tks = spec.toeKickSetback;
  const gap = spec.doorGap;
  const inset = spec.backInset;

  const carcassInnerWidth = W - 2 * t;
  const carcassAboveToe = H - tk;
  const stretcherDepth = 100;

  const parts: Part[] = [];

  parts.push({
    id: "left-side",
    name: "Left Side",
    material: panel,
    cutLength: H,
    cutWidth: D,
    cutThickness: t,
    grain: "length",
    size: [t, H, D],
    position: [t / 2, H / 2, D / 2],
    quantity: 1,
  });

  parts.push({
    id: "right-side",
    name: "Right Side",
    material: panel,
    cutLength: H,
    cutWidth: D,
    cutThickness: t,
    grain: "length",
    size: [t, H, D],
    position: [W - t / 2, H / 2, D / 2],
    quantity: 1,
  });

  parts.push({
    id: "bottom",
    name: "Bottom",
    material: panel,
    cutLength: carcassInnerWidth,
    cutWidth: D,
    cutThickness: t,
    grain: "length",
    size: [carcassInnerWidth, t, D],
    position: [W / 2, tk + t / 2, D / 2],
    quantity: 1,
  });

  parts.push({
    id: "stretcher-front",
    name: "Top Stretcher (Front)",
    material: panel,
    cutLength: carcassInnerWidth,
    cutWidth: stretcherDepth,
    cutThickness: t,
    grain: "length",
    size: [carcassInnerWidth, t, stretcherDepth],
    position: [W / 2, H - t / 2, D - stretcherDepth / 2],
    quantity: 1,
  });

  parts.push({
    id: "stretcher-back",
    name: "Top Stretcher (Back)",
    material: panel,
    cutLength: carcassInnerWidth,
    cutWidth: stretcherDepth,
    cutThickness: t,
    grain: "length",
    size: [carcassInnerWidth, t, stretcherDepth],
    position: [W / 2, H - t / 2, stretcherDepth / 2],
    quantity: 1,
  });

  parts.push({
    id: "toe-kick",
    name: "Toe Kick",
    material: panel,
    cutLength: W,
    cutWidth: tk,
    cutThickness: t,
    grain: "length",
    size: [W, tk, t],
    position: [W / 2, tk / 2, tks + t / 2],
    quantity: 1,
  });

  const backHeight = carcassAboveToe;
  parts.push({
    id: "back",
    name: "Back Panel",
    material: back,
    cutLength: carcassInnerWidth,
    cutWidth: backHeight,
    cutThickness: tb,
    grain: "length",
    size: [carcassInnerWidth, backHeight, tb],
    position: [W / 2, tk + backHeight / 2, inset + tb / 2],
    quantity: 1,
  });

  const shelfDepth = D - inset - tb - 20;
  const shelfClearTop = H - t - 20;
  const shelfClearBottom = tk + t + 20;
  const shelfSpan = shelfClearTop - shelfClearBottom;
  for (let i = 0; i < spec.shelfCount; i++) {
    const y =
      shelfClearBottom + ((i + 1) * shelfSpan) / (spec.shelfCount + 1);
    parts.push({
      id: `shelf-${i + 1}`,
      name: `Shelf ${i + 1}`,
      material: panel,
      cutLength: carcassInnerWidth - 3,
      cutWidth: shelfDepth,
      cutThickness: t,
      grain: "length",
      size: [carcassInnerWidth - 3, t, shelfDepth],
      position: [W / 2, y, inset + tb + shelfDepth / 2],
      quantity: 1,
    });
  }

  const doorAreaHeight = carcassAboveToe - 2 * gap;
  const doorAreaWidth = W - 2 * gap;
  if (spec.doorStyle === "single") {
    parts.push({
      id: "door",
      name: "Door",
      material: door,
      cutLength: doorAreaHeight,
      cutWidth: doorAreaWidth,
      cutThickness: td,
      grain: "length",
      size: [doorAreaWidth, doorAreaHeight, td],
      position: [W / 2, tk + carcassAboveToe / 2, D + td / 2 + 1],
      quantity: 1,
    });
  } else if (spec.doorStyle === "double") {
    const dw = (doorAreaWidth - gap) / 2;
    parts.push({
      id: "door-left",
      name: "Door (Left)",
      material: door,
      cutLength: doorAreaHeight,
      cutWidth: dw,
      cutThickness: td,
      grain: "length",
      size: [dw, doorAreaHeight, td],
      position: [gap + dw / 2, tk + carcassAboveToe / 2, D + td / 2 + 1],
      quantity: 1,
    });
    parts.push({
      id: "door-right",
      name: "Door (Right)",
      material: door,
      cutLength: doorAreaHeight,
      cutWidth: dw,
      cutThickness: td,
      grain: "length",
      size: [dw, doorAreaHeight, td],
      position: [W - gap - dw / 2, tk + carcassAboveToe / 2, D + td / 2 + 1],
      quantity: 1,
    });
  } else if (spec.doorStyle === "drawerFront") {
    parts.push({
      id: "drawer-front",
      name: "Drawer Front",
      material: door,
      cutLength: doorAreaWidth,
      cutWidth: doorAreaHeight,
      cutThickness: td,
      grain: "length",
      size: [doorAreaWidth, doorAreaHeight, td],
      position: [W / 2, tk + carcassAboveToe / 2, D + td / 2 + 1],
      quantity: 1,
    });
  }

  return { spec, parts };
}

export const DEFAULT_BASE_CABINET: BaseCabinetSpec = {
  id: "base-1",
  width: 600,
  height: 870,
  depth: 580,
  toeKickHeight: 100,
  toeKickSetback: 60,
  panelMaterialId: "ply18",
  backMaterialId: "ply6",
  doorMaterialId: "mdf18",
  shelfCount: 1,
  doorStyle: "double",
  doorGap: 3,
  backInset: 12,
};
