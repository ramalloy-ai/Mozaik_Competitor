import type { Cabinet, CabinetSpec, Part } from "../types";
import { getMaterial } from "../library";
import { joineryDeltas } from "./joinery";
import { addFaceFrameParts } from "./faceFrame";

// Tall cabinet: toe kick + full sides + full top + back + shelves + tall doors.
// `tallUpperFraction > 0` splits doors into upper/lower pairs.
export function buildTall(spec: CabinetSpec): Cabinet {
  const panel = getMaterial(spec.panelMaterialId);
  const back = getMaterial(spec.backMaterialId);
  const door = getMaterial(spec.doorMaterialId);
  const edge = spec.edgeBandingId;

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
  const innerW = W - 2 * t;
  const above = H - tk;
  const dj = joineryDeltas(spec);

  const parts: Part[] = [];
  const push = (p: Omit<Part, "cabinetId" | "cabinetName">) =>
    parts.push({ ...p, cabinetId: spec.id, cabinetName: spec.name });

  push({
    id: `${spec.id}-left`,
    name: "Left Side",
    material: panel,
    cutLength: H,
    cutWidth: D,
    cutThickness: t,
    grain: "length",
    size: [t, H, D],
    position: [t / 2, H / 2, D / 2],
    quantity: 1,
    edges: { front: edge },
  });
  push({
    id: `${spec.id}-right`,
    name: "Right Side",
    material: panel,
    cutLength: H,
    cutWidth: D,
    cutThickness: t,
    grain: "length",
    size: [t, H, D],
    position: [W - t / 2, H / 2, D / 2],
    quantity: 1,
    edges: { front: edge },
  });
  push({
    id: `${spec.id}-bottom`,
    name: "Bottom",
    material: panel,
    cutLength: innerW + dj.topBottomLengthBoost,
    cutWidth: D,
    cutThickness: t,
    grain: "length",
    size: [innerW, t, D],
    position: [W / 2, tk + t / 2, D / 2],
    quantity: 1,
    edges: { front: edge },
  });
  push({
    id: `${spec.id}-top`,
    name: "Top",
    material: panel,
    cutLength: innerW + dj.topBottomLengthBoost,
    cutWidth: D,
    cutThickness: t,
    grain: "length",
    size: [innerW, t, D],
    position: [W / 2, H - t / 2, D / 2],
    quantity: 1,
    edges: { front: edge },
  });
  push({
    id: `${spec.id}-toe`,
    name: "Toe Kick",
    material: panel,
    cutLength: W,
    cutWidth: tk,
    cutThickness: t,
    grain: "length",
    size: [W, tk, t],
    position: [W / 2, tk / 2, tks + t / 2],
    quantity: 1,
    edges: { front: edge },
  });

  const tallBackH = above - 2 * t;
  const tallBackLong = Math.max(innerW, tallBackH) + dj.backLengthBoost;
  const tallBackShort = Math.min(innerW, tallBackH) + dj.backHeightBoost;
  push({
    id: `${spec.id}-back`,
    name: "Back Panel",
    material: back,
    cutLength: tallBackLong,
    cutWidth: tallBackShort,
    cutThickness: tb,
    grain: "length",
    size: [innerW, tallBackH, tb],
    position: [W / 2, tk + above / 2, inset + tb / 2],
    quantity: 1,
    edges: {},
  });

  const shelfDepth = D - inset - tb - 20;
  const shelfYTop = H - t - 30;
  const shelfYBot = tk + t + 30;
  const shelfSpan = shelfYTop - shelfYBot;
  for (let i = 0; i < spec.shelfCount; i++) {
    const y = shelfYBot + ((i + 1) * shelfSpan) / (spec.shelfCount + 1);
    push({
      id: `${spec.id}-shelf-${i + 1}`,
      name: `Shelf ${i + 1}`,
      material: panel,
      cutLength: innerW - 3 + dj.topBottomLengthBoost,
      cutWidth: shelfDepth,
      cutThickness: t,
      grain: "length",
      size: [innerW - 3, t, shelfDepth],
      position: [W / 2, y, inset + tb + shelfDepth / 2],
      quantity: 1,
      edges: { front: edge },
    });
  }

  const ff = addFaceFrameParts(spec, { yBottom: tk, yTop: H });
  parts.push(...ff.parts);
  const doorAreaH = above - 2 * gap - ff.doorInsetY.bot - ff.doorInsetY.top;
  const doorAreaW = W - 2 * gap - 2 * ff.doorInsetX;
  const doorBaseX = gap + ff.doorInsetX;
  const doorBaseY = tk + gap + ff.doorInsetY.bot;
  const doorZ = D + ff.doorOffsetZ + td / 2 + 1;
  const split = spec.tallUpperFraction > 0 && spec.tallUpperFraction < 1;
  const midGap = spec.tallDoorMidGap;
  const upperH = split
    ? doorAreaH * spec.tallUpperFraction - midGap / 2
    : doorAreaH;
  const lowerH = split
    ? doorAreaH * (1 - spec.tallUpperFraction) - midGap / 2
    : 0;
  const upperCenterY =
    doorBaseY + lowerH + (split ? midGap : 0) + upperH / 2;
  const lowerCenterY = doorBaseY + lowerH / 2;

  const placeDoorPair = (
    suffix: string,
    name: string,
    centerY: number,
    h: number,
  ) => {
    if (spec.doorStyle === "double") {
      const dw = (doorAreaW - gap) / 2;
      push({
        id: `${spec.id}-door-l-${suffix}`,
        name: `Door (Left ${name})`,
        material: door,
        cutLength: h,
        cutWidth: dw,
        cutThickness: td,
        grain: "length",
        size: [dw, h, td],
        position: [doorBaseX + dw / 2, centerY, doorZ],
        quantity: 1,
        edges: { front: edge, back: edge, left: edge, right: edge },
      });
      push({
        id: `${spec.id}-door-r-${suffix}`,
        name: `Door (Right ${name})`,
        material: door,
        cutLength: h,
        cutWidth: dw,
        cutThickness: td,
        grain: "length",
        size: [dw, h, td],
        position: [W - doorBaseX - dw / 2, centerY, doorZ],
        quantity: 1,
        edges: { front: edge, back: edge, left: edge, right: edge },
      });
    } else if (spec.doorStyle === "single") {
      push({
        id: `${spec.id}-door-${suffix}`,
        name: `Door (${name})`,
        material: door,
        cutLength: h,
        cutWidth: doorAreaW,
        cutThickness: td,
        grain: "length",
        size: [doorAreaW, h, td],
        position: [W / 2, centerY, doorZ],
        quantity: 1,
        edges: { front: edge, back: edge, left: edge, right: edge },
      });
    }
  };

  if (split) {
    placeDoorPair("lo", "Lower", lowerCenterY, lowerH);
    placeDoorPair("hi", "Upper", upperCenterY, upperH);
  } else {
    placeDoorPair("full", "Full", doorBaseY + doorAreaH / 2, doorAreaH);
  }

  return { spec, parts };
}
