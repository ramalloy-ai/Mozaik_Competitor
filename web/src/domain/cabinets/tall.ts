import type { Cabinet, CabinetSpec, Part } from "../types";
import { getMaterial } from "../library";

// Tall cabinet: toe kick + full sides + full top + back + shelves + tall doors.
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
    cutLength: innerW,
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
    cutLength: innerW,
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

  push({
    id: `${spec.id}-back`,
    name: "Back Panel",
    material: back,
    cutLength: innerW,
    cutWidth: above - 2 * t,
    cutThickness: tb,
    grain: "length",
    size: [innerW, above - 2 * t, tb],
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
      cutLength: innerW - 3,
      cutWidth: shelfDepth,
      cutThickness: t,
      grain: "length",
      size: [innerW - 3, t, shelfDepth],
      position: [W / 2, y, inset + tb + shelfDepth / 2],
      quantity: 1,
      edges: { front: edge },
    });
  }

  const doorH = above - 2 * gap;
  const doorW = W - 2 * gap;
  if (spec.doorStyle === "double") {
    const dw = (doorW - gap) / 2;
    // Tall cabinets typically get split doors (upper + lower) but for v1
    // we ship a single pair of full-height doors.
    push({
      id: `${spec.id}-door-l`,
      name: "Door (Left)",
      material: door,
      cutLength: doorH,
      cutWidth: dw,
      cutThickness: td,
      grain: "length",
      size: [dw, doorH, td],
      position: [gap + dw / 2, tk + above / 2, D + td / 2 + 1],
      quantity: 1,
      edges: { front: edge, back: edge, left: edge, right: edge },
    });
    push({
      id: `${spec.id}-door-r`,
      name: "Door (Right)",
      material: door,
      cutLength: doorH,
      cutWidth: dw,
      cutThickness: td,
      grain: "length",
      size: [dw, doorH, td],
      position: [W - gap - dw / 2, tk + above / 2, D + td / 2 + 1],
      quantity: 1,
      edges: { front: edge, back: edge, left: edge, right: edge },
    });
  } else if (spec.doorStyle === "single") {
    push({
      id: `${spec.id}-door`,
      name: "Door",
      material: door,
      cutLength: doorH,
      cutWidth: doorW,
      cutThickness: td,
      grain: "length",
      size: [doorW, doorH, td],
      position: [W / 2, tk + above / 2, D + td / 2 + 1],
      quantity: 1,
      edges: { front: edge, back: edge, left: edge, right: edge },
    });
  }

  return { spec, parts };
}
