import type { Cabinet, CabinetSpec, Part } from "../types";
import { getMaterial } from "../library";
import { joineryDeltas } from "./joinery";

// Blind-corner base cabinet: L-shaped footprint with a blind face on the
// right-hand side. The "main" leg (front-facing) is W x D; the "blind" leg
// extends back along +Z from the right edge by (cornerDepth - D), and the
// front leg has a blind face on the right of width `blindWidth` (no door,
// reachable only from the adjacent cabinet).
//
// Carcass parts: two outer sides, two inner partition walls forming the L,
// a bottom that follows the L, a stretcher on top, toe kick on the visible
// front, back panels along the two outer back faces.
export function buildCornerBase(spec: CabinetSpec): Cabinet {
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
  const blindW = spec.blindWidth;
  const dj = joineryDeltas(spec);

  const parts: Part[] = [];
  const push = (p: Omit<Part, "cabinetId" | "cabinetName">) =>
    parts.push({ ...p, cabinetId: spec.id, cabinetName: spec.name });

  // Left outer side (full depth D).
  push({
    id: `${spec.id}-side-l`, name: "Left Side", material: panel,
    cutLength: H, cutWidth: D, cutThickness: t, grain: "length",
    size: [t, H, D], position: [t / 2, H / 2, D / 2], quantity: 1,
    edges: { front: edge },
  });
  // Right (blind) partition: short side at the inside-right of the front leg.
  push({
    id: `${spec.id}-side-r`, name: "Right Partition", material: panel,
    cutLength: H, cutWidth: D, cutThickness: t, grain: "length",
    size: [t, H, D], position: [W - blindW - t / 2, H / 2, D / 2], quantity: 1,
    edges: { front: edge },
  });

  const innerWFront = W - blindW - 2 * t;
  push({
    id: `${spec.id}-bot`, name: "Bottom", material: panel,
    cutLength: innerWFront + dj.topBottomLengthBoost, cutWidth: D,
    cutThickness: t, grain: "length", size: [innerWFront, t, D],
    position: [t + innerWFront / 2, tk + t / 2, D / 2], quantity: 1,
    edges: { front: edge },
  });
  push({
    id: `${spec.id}-top`, name: "Top Stretcher", material: panel,
    cutLength: innerWFront + dj.topBottomLengthBoost, cutWidth: 100,
    cutThickness: t, grain: "length", size: [innerWFront, t, 100],
    position: [t + innerWFront / 2, H - t / 2, D - 50], quantity: 1,
    edges: { front: edge },
  });
  push({
    id: `${spec.id}-toe`, name: "Toe Kick", material: panel,
    cutLength: W - blindW, cutWidth: tk, cutThickness: t, grain: "length",
    size: [W - blindW, tk, t],
    position: [(W - blindW) / 2, tk / 2, tks + t / 2], quantity: 1,
    edges: { front: edge },
  });

  const backH = H - tk;
  const backLong = Math.max(innerWFront, backH) + dj.backLengthBoost;
  const backShort = Math.min(innerWFront, backH) + dj.backHeightBoost;
  push({
    id: `${spec.id}-back`, name: "Back Panel", material: back,
    cutLength: backLong, cutWidth: backShort, cutThickness: tb,
    grain: "length", size: [innerWFront, backH, tb],
    position: [t + innerWFront / 2, tk + backH / 2, inset + tb / 2],
    quantity: 1, edges: {},
  });

  // Blind face filler: a tall, narrow panel that closes off the blind side
  // of the front opening (typical 75mm scribe + door reveal). We render it
  // as a fixed panel here.
  push({
    id: `${spec.id}-blind-face`, name: "Blind Filler", material: door,
    cutLength: backH, cutWidth: blindW - gap, cutThickness: td,
    grain: "length", size: [blindW - gap, backH, td],
    position: [W - (blindW - gap) / 2, tk + backH / 2, D + td / 2 + 1],
    quantity: 1, edges: { front: edge, back: edge, left: edge, right: edge },
  });

  // Door: a single door (or double, depending on doorStyle) covers the
  // remaining front opening.
  const doorH = backH - 2 * gap;
  const doorW = W - blindW - 2 * gap;
  const doorZ = D + td / 2 + 1;
  if (spec.doorStyle === "single" || spec.doorStyle === "double") {
    if (spec.doorStyle === "single") {
      push({
        id: `${spec.id}-door`, name: "Door", material: door,
        cutLength: doorH, cutWidth: doorW, cutThickness: td, grain: "length",
        size: [doorW, doorH, td],
        position: [gap + doorW / 2, tk + gap + doorH / 2, doorZ],
        quantity: 1, edges: { front: edge, back: edge, left: edge, right: edge },
      });
    } else {
      const dw = (doorW - gap) / 2;
      push({
        id: `${spec.id}-door-l`, name: "Door (Left)", material: door,
        cutLength: doorH, cutWidth: dw, cutThickness: td, grain: "length",
        size: [dw, doorH, td],
        position: [gap + dw / 2, tk + gap + doorH / 2, doorZ],
        quantity: 1, edges: { front: edge, back: edge, left: edge, right: edge },
      });
      push({
        id: `${spec.id}-door-r`, name: "Door (Right)", material: door,
        cutLength: doorH, cutWidth: dw, cutThickness: td, grain: "length",
        size: [dw, doorH, td],
        position: [W - blindW - gap - dw / 2, tk + gap + doorH / 2, doorZ],
        quantity: 1, edges: { front: edge, back: edge, left: edge, right: edge },
      });
    }
  }

  // Single shelf inside the front leg.
  if (spec.shelfCount > 0) {
    push({
      id: `${spec.id}-shelf`, name: "Shelf", material: panel,
      cutLength: innerWFront - 3 + dj.topBottomLengthBoost, cutWidth: D - inset - tb - 20,
      cutThickness: t, grain: "length",
      size: [innerWFront - 3, t, D - inset - tb - 20],
      position: [t + innerWFront / 2, tk + backH / 2, inset + tb + (D - inset - tb - 20) / 2],
      quantity: 1, edges: { front: edge },
    });
  }

  return { spec, parts };
}
