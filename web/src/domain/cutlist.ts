import type { Cabinet, CutlistRow, Part } from "./types";
import { partBandedMeters } from "./edgeBanding";

function partKey(p: Part): string {
  return [
    p.material.id,
    Math.round(p.cutLength),
    Math.round(p.cutWidth),
    Math.round(p.cutThickness),
    p.grain,
    p.name,
    JSON.stringify(p.edges),
  ].join("|");
}

export function buildCutlist(cabinets: Cabinet[]): CutlistRow[] {
  const groups = new Map<string, CutlistRow>();
  for (const cab of cabinets) {
    for (const part of cab.parts) {
      const key = partKey(part);
      const existing = groups.get(key);
      const banded = partBandedMeters(part);
      if (existing) {
        existing.quantity += part.quantity;
        existing.edgeBandedMeters += banded;
      } else {
        groups.set(key, {
          partName: part.name,
          materialName: part.material.name,
          length: Math.round(part.cutLength),
          width: Math.round(part.cutWidth),
          thickness: part.cutThickness,
          grain: part.grain,
          quantity: part.quantity,
          edgeBandedMeters: banded,
        });
      }
    }
  }
  return Array.from(groups.values()).sort((a, b) => {
    if (a.materialName !== b.materialName)
      return a.materialName.localeCompare(b.materialName);
    if (a.length !== b.length) return b.length - a.length;
    return b.width - a.width;
  });
}

export function totalBoardArea(rows: CutlistRow[]): number {
  return rows.reduce(
    (sum, r) => sum + (r.length * r.width * r.quantity) / 1_000_000,
    0,
  );
}
