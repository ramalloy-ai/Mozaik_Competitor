import type { Cabinet, CabinetSpec, Part } from "../types";
import { getMaterial } from "../library";
import { joineryDeltas } from "./joinery";
import { addFaceFrameParts } from "./faceFrame";

// Sink base: like a regular base but with no floor (open for plumbing),
// a false drawer front filling the top opening, and double doors below.
export function buildSinkBase(spec: CabinetSpec): Cabinet {
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
  const STRETCHER_DEPTH = 100;

  const parts: Part[] = [];
  const push = (p: Omit<Part, "cabinetId" | "cabinetName">) =>
    parts.push({ ...p, cabinetId: spec.id, cabinetName: spec.name });

  push({
    id: `${spec.id}-left`, name: "Left Side", material: panel,
    cutLength: H, cutWidth: D, cutThickness: t, grain: "length",
    size: [t, H, D], position: [t / 2, H / 2, D / 2], quantity: 1,
    edges: { front: edge },
  });
  push({
    id: `${spec.id}-right`, name: "Right Side", material: panel,
    cutLength: H, cutWidth: D, cutThickness: t, grain: "length",
    size: [t, H, D], position: [W - t / 2, H / 2, D / 2], quantity: 1,
    edges: { front: edge },
  });
  push({
    id: `${spec.id}-strF`, name: "Top Stretcher (Front)", material: panel,
    cutLength: innerW + dj.topBottomLengthBoost, cutWidth: STRETCHER_DEPTH,
    cutThickness: t, grain: "length", size: [innerW, t, STRETCHER_DEPTH],
    position: [W / 2, H - t / 2, D - STRETCHER_DEPTH / 2], quantity: 1,
    edges: { front: edge },
  });
  push({
    id: `${spec.id}-strB`, name: "Top Stretcher (Back)", material: panel,
    cutLength: innerW + dj.topBottomLengthBoost, cutWidth: STRETCHER_DEPTH,
    cutThickness: t, grain: "length", size: [innerW, t, STRETCHER_DEPTH],
    position: [W / 2, H - t / 2, STRETCHER_DEPTH / 2], quantity: 1,
    edges: {},
  });
  push({
    id: `${spec.id}-strBot`, name: "Bottom Stretcher (Front)", material: panel,
    cutLength: innerW + dj.topBottomLengthBoost, cutWidth: STRETCHER_DEPTH,
    cutThickness: t, grain: "length", size: [innerW, t, STRETCHER_DEPTH],
    position: [W / 2, tk + t / 2, D - STRETCHER_DEPTH / 2], quantity: 1,
    edges: { front: edge },
  });
  push({
    id: `${spec.id}-toe`, name: "Toe Kick", material: panel,
    cutLength: W, cutWidth: tk, cutThickness: t, grain: "length",
    size: [W, tk, t], position: [W / 2, tk / 2, tks + t / 2], quantity: 1,
    edges: { front: edge },
  });

  const backH = H - tk;
  const backLong = Math.max(innerW, backH) + dj.backLengthBoost;
  const backShort = Math.min(innerW, backH) + dj.backHeightBoost;
  push({
    id: `${spec.id}-back`, name: "Back Panel", material: back,
    cutLength: backLong, cutWidth: backShort, cutThickness: tb,
    grain: "length", size: [innerW, backH, tb],
    position: [W / 2, tk + backH / 2, inset + tb / 2], quantity: 1, edges: {},
  });

  const ff = addFaceFrameParts(spec, { yBottom: tk, yTop: H });
  parts.push(...ff.parts);
  const doorZ = D + ff.doorOffsetZ + td / 2 + 1;

  const frontAreaH = above - 2 * gap - ff.doorInsetY.bot - ff.doorInsetY.top;
  const frontW = W - 2 * gap - 2 * ff.doorInsetX;
  // Top 150mm is a false drawer front; remainder is double doors.
  const falseFrontH = 150;
  const doorH = frontAreaH - falseFrontH - gap;
  const doorBaseX = gap + ff.doorInsetX;
  const doorBaseY = tk + gap + ff.doorInsetY.bot;

  push({
    id: `${spec.id}-false-front`, name: "False Drawer Front (Sink)",
    material: door, cutLength: frontW, cutWidth: falseFrontH, cutThickness: td,
    grain: "length", size: [frontW, falseFrontH, td],
    position: [W / 2, doorBaseY + doorH + gap + falseFrontH / 2, doorZ],
    quantity: 1, edges: { front: edge, back: edge, left: edge, right: edge },
  });

  const dw = (frontW - gap) / 2;
  push({
    id: `${spec.id}-door-l`, name: "Door (Left)", material: door,
    cutLength: doorH, cutWidth: dw, cutThickness: td, grain: "length",
    size: [dw, doorH, td],
    position: [doorBaseX + dw / 2, doorBaseY + doorH / 2, doorZ],
    quantity: 1, edges: { front: edge, back: edge, left: edge, right: edge },
  });
  push({
    id: `${spec.id}-door-r`, name: "Door (Right)", material: door,
    cutLength: doorH, cutWidth: dw, cutThickness: td, grain: "length",
    size: [dw, doorH, td],
    position: [W - doorBaseX - dw / 2, doorBaseY + doorH / 2, doorZ],
    quantity: 1, edges: { front: edge, back: edge, left: edge, right: edge },
  });

  return { spec, parts };
}
