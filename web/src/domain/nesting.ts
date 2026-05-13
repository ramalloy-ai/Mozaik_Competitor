import type { Cabinet, Part } from "./types";
import { getMaterial, type SheetMaterial } from "./library";

export interface NestedPart {
  part: Part;
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
}

export interface Sheet {
  materialId: string;
  materialName: string;
  sheetLength: number;
  sheetWidth: number;
  parts: NestedPart[];
  utilization: number;
}

interface Free {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Item {
  part: Part;
  w: number;
  h: number;
  // copy index within the part's quantity
  index: number;
}

// MaxRects bin packing — Best-Short-Side-Fit heuristic. Rotation allowed for
// non-grain materials; grain-restricted parts (hasGrain && grain="length")
// must keep their length axis aligned with the sheet length.
export function nest(cabinets: Cabinet[], kerf = 3): Sheet[] {
  // Bucket items per material.
  const buckets = new Map<string, Item[]>();
  for (const cab of cabinets) {
    for (const part of cab.parts) {
      const arr = buckets.get(part.material.id) ?? [];
      for (let i = 0; i < part.quantity; i++) {
        arr.push({
          part,
          w: part.cutLength + kerf,
          h: part.cutWidth + kerf,
          index: i,
        });
      }
      buckets.set(part.material.id, arr);
    }
  }

  const sheets: Sheet[] = [];
  for (const [matId, items] of buckets) {
    const mat = getMaterial(matId);
    // Sort by max side desc; helps best-fit heuristic land big pieces first.
    items.sort((a, b) => Math.max(b.w, b.h) - Math.max(a.w, a.h));

    let remaining = items.slice();
    while (remaining.length) {
      const sheet = makeSheet(mat);
      remaining = packIntoSheet(sheet, remaining, mat, kerf);
      sheets.push(sheet);
    }
  }
  return sheets;
}

function makeSheet(mat: SheetMaterial): Sheet {
  return {
    materialId: mat.id,
    materialName: mat.name,
    sheetLength: mat.sheetLength,
    sheetWidth: mat.sheetWidth,
    parts: [],
    utilization: 0,
  };
}

function packIntoSheet(
  sheet: Sheet,
  items: Item[],
  mat: SheetMaterial,
  kerf: number,
): Item[] {
  const free: Free[] = [
    { x: 0, y: 0, w: sheet.sheetLength, h: sheet.sheetWidth },
  ];
  const leftovers: Item[] = [];
  let usedArea = 0;
  for (const item of items) {
    const canRotate = !(mat.hasGrain && item.part.grain === "length");
    const placement = findBestPlacement(free, item.w, item.h, canRotate);
    if (!placement) {
      leftovers.push(item);
      continue;
    }
    sheet.parts.push({
      part: item.part,
      x: placement.x,
      y: placement.y,
      width: placement.rotated ? item.h - kerf : item.w - kerf,
      height: placement.rotated ? item.w - kerf : item.h - kerf,
      rotated: placement.rotated,
    });
    usedArea +=
      (placement.rotated ? item.h - kerf : item.w - kerf) *
      (placement.rotated ? item.w - kerf : item.h - kerf);
    splitFreeRects(free, {
      x: placement.x,
      y: placement.y,
      w: placement.rotated ? item.h : item.w,
      h: placement.rotated ? item.w : item.h,
    });
    pruneFreeRects(free);
  }
  sheet.utilization = usedArea / (sheet.sheetLength * sheet.sheetWidth);
  return leftovers;
}

interface Placement {
  x: number;
  y: number;
  rotated: boolean;
  score: number;
}

function findBestPlacement(
  free: Free[],
  w: number,
  h: number,
  canRotate: boolean,
): Placement | null {
  let best: Placement | null = null;
  for (const f of free) {
    if (f.w >= w && f.h >= h) {
      const leftover = Math.min(f.w - w, f.h - h);
      if (!best || leftover < best.score) {
        best = { x: f.x, y: f.y, rotated: false, score: leftover };
      }
    }
    if (canRotate && f.w >= h && f.h >= w) {
      const leftover = Math.min(f.w - h, f.h - w);
      if (!best || leftover < best.score) {
        best = { x: f.x, y: f.y, rotated: true, score: leftover };
      }
    }
  }
  return best;
}

function splitFreeRects(free: Free[], used: Free) {
  for (let i = free.length - 1; i >= 0; i--) {
    const f = free[i];
    if (
      used.x >= f.x + f.w ||
      used.x + used.w <= f.x ||
      used.y >= f.y + f.h ||
      used.y + used.h <= f.y
    )
      continue;
    free.splice(i, 1);
    if (used.x > f.x) free.push({ x: f.x, y: f.y, w: used.x - f.x, h: f.h });
    if (used.x + used.w < f.x + f.w)
      free.push({
        x: used.x + used.w,
        y: f.y,
        w: f.x + f.w - (used.x + used.w),
        h: f.h,
      });
    if (used.y > f.y) free.push({ x: f.x, y: f.y, w: f.w, h: used.y - f.y });
    if (used.y + used.h < f.y + f.h)
      free.push({
        x: f.x,
        y: used.y + used.h,
        w: f.w,
        h: f.y + f.h - (used.y + used.h),
      });
  }
}

function pruneFreeRects(free: Free[]) {
  for (let i = 0; i < free.length; i++) {
    for (let j = i + 1; j < free.length; j++) {
      if (contains(free[j], free[i])) {
        free.splice(i, 1);
        i--;
        break;
      }
      if (contains(free[i], free[j])) {
        free.splice(j, 1);
        j--;
      }
    }
  }
}

function contains(a: Free, b: Free): boolean {
  return (
    b.x >= a.x &&
    b.y >= a.y &&
    b.x + b.w <= a.x + a.w &&
    b.y + b.h <= a.y + a.h
  );
}
