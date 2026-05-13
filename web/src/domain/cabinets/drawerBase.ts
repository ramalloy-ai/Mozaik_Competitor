import type { Cabinet, CabinetSpec, Part } from "../types";
import { getMaterial } from "../library";
import { joineryDeltas } from "./joinery";
import { addFaceFrameParts } from "./faceFrame";

// Drawer-base cabinet: same carcass as a base, but the front opening is
// divided into N stacked drawer banks. Each bank generates four box parts
// (left/right sides, back, bottom) plus a drawer front. Drawer-side height
// is 50mm below the bank height to clear the slide; bottom recesses into a
// dado in the sides (typical 1/4 dado, 12mm up from the bottom).
export function buildDrawerBase(spec: CabinetSpec): Cabinet {
  const panel = getMaterial(spec.panelMaterialId);
  const back = getMaterial(spec.backMaterialId);
  const door = getMaterial(spec.doorMaterialId);
  const boxMat = getMaterial("mdf12");
  const edge = spec.edgeBandingId;

  const t = panel.thickness;
  const tb = back.thickness;
  const td = door.thickness;
  const tBox = boxMat.thickness;
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

  // Carcass (same as base, sans shelves + doors).
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
    id: `${spec.id}-bottom`, name: "Bottom", material: panel,
    cutLength: innerW + dj.topBottomLengthBoost, cutWidth: D, cutThickness: t,
    grain: "length", size: [innerW, t, D],
    position: [W / 2, tk + t / 2, D / 2], quantity: 1, edges: { front: edge },
  });
  push({
    id: `${spec.id}-top`, name: "Top", material: panel,
    cutLength: innerW + dj.topBottomLengthBoost, cutWidth: D, cutThickness: t,
    grain: "length", size: [innerW, t, D],
    position: [W / 2, H - t / 2, D / 2], quantity: 1, edges: { front: edge },
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

  // Face frame (optional).
  const ff = addFaceFrameParts(spec, { yBottom: tk, yTop: H });
  parts.push(...ff.parts);
  const frontInsetX = ff.doorInsetX;
  const frontInsetBot = ff.doorInsetY.bot;
  const frontInsetTop = ff.doorInsetY.top;
  const doorZ = D + ff.doorOffsetZ + td / 2 + 1;

  // Compute drawer bank heights using a common cabinet-maker ratio:
  // top drawer ~150mm, remaining banks share equally.
  const n = Math.max(1, spec.drawerCount);
  const frontH = above - 2 * gap - frontInsetBot - frontInsetTop;
  const frontW = W - 2 * gap - 2 * frontInsetX;
  const topBankFraction = n >= 3 ? 0.18 : 1 / n;
  const topBank = n >= 3 ? frontH * topBankFraction : frontH / n;
  const remBanks = n - 1 > 0 ? (frontH - topBank - (n - 1) * gap) / (n - 1) : 0;
  const bankHeights = Array.from({ length: n }, (_, i) =>
    n >= 3 && i === n - 1 ? topBank : remBanks,
  );
  // Sanity: when n=1 the array above gives [topBank] which equals frontH.
  if (n === 1) bankHeights[0] = frontH;
  if (n === 2) {
    bankHeights[0] = frontH * 0.55;
    bankHeights[1] = frontH * 0.45 - gap;
  }

  // Drawer slide rebate: how far each side of the drawer box sits in from the
  // cabinet inner side wall to leave room for the slide hardware (~12mm/side).
  const slideRebate = 12;
  const boxInnerW = innerW - 2 * slideRebate;
  const boxDepth = D - 30; // shy of the back panel

  let yCursor = tk + gap + frontInsetBot;
  for (let i = 0; i < n; i++) {
    const bankH = bankHeights[i];
    const bankCenterY = yCursor + bankH / 2;
    yCursor += bankH + gap;

    // Drawer front (door-style "drawerFront" semantics).
    push({
      id: `${spec.id}-df-${i}`,
      name: `Drawer Front ${i + 1}`,
      material: door,
      cutLength: frontW,
      cutWidth: bankH,
      cutThickness: td,
      grain: "length",
      size: [frontW, bankH, td],
      position: [W / 2, bankCenterY, doorZ],
      quantity: 1,
      edges: { front: edge, back: edge, left: edge, right: edge },
    });

    // Drawer box (sides, back, bottom). Side height = bank height - 25mm
    // bottom clearance - 25mm top clearance (typical with metabox/blum).
    const sideH = Math.max(80, bankH - 50);
    const boxBottomY = bankCenterY - sideH / 2 + tBox / 2;
    push({
      id: `${spec.id}-dl-${i}`,
      name: `Drawer Side (L) ${i + 1}`,
      material: boxMat,
      cutLength: boxDepth,
      cutWidth: sideH,
      cutThickness: tBox,
      grain: "length",
      size: [tBox, sideH, boxDepth],
      position: [t + slideRebate + tBox / 2, bankCenterY, D / 2 + 5],
      quantity: 1,
      edges: { front: edge },
    });
    push({
      id: `${spec.id}-dr-${i}`,
      name: `Drawer Side (R) ${i + 1}`,
      material: boxMat,
      cutLength: boxDepth,
      cutWidth: sideH,
      cutThickness: tBox,
      grain: "length",
      size: [tBox, sideH, boxDepth],
      position: [W - t - slideRebate - tBox / 2, bankCenterY, D / 2 + 5],
      quantity: 1,
      edges: { front: edge },
    });
    push({
      id: `${spec.id}-dbk-${i}`,
      name: `Drawer Back ${i + 1}`,
      material: boxMat,
      cutLength: boxInnerW - 2 * tBox,
      cutWidth: sideH,
      cutThickness: tBox,
      grain: "length",
      size: [boxInnerW - 2 * tBox, sideH, tBox],
      position: [W / 2, bankCenterY, D - 30 + tBox / 2],
      quantity: 1,
      edges: { front: edge },
    });
    push({
      id: `${spec.id}-dbt-${i}`,
      name: `Drawer Bottom ${i + 1}`,
      material: boxMat,
      cutLength: boxInnerW - 2 * tBox + 12,
      cutWidth: boxDepth - tBox - 12,
      cutThickness: tBox,
      grain: "length",
      size: [boxInnerW - 2 * tBox, tBox, boxDepth - tBox],
      position: [W / 2, boxBottomY, D / 2 + 5],
      quantity: 1,
      edges: {},
    });
  }

  return { spec, parts };
}
