import type { Cabinet, EdgeKey, Part } from "./types";
import { getEdgeBanding } from "./library";

export interface EdgeBandingTotal {
  edgeBandingId: string;
  edgeBandingName: string;
  meters: number;
  pricePerMeter: number;
  cost: number;
}

export function partBandedMeters(part: Part): number {
  let mm = 0;
  const edges = part.edges;
  const longSide = part.cutLength;
  const shortSide = part.cutWidth;
  if (edges.front) mm += longSide;
  if (edges.back) mm += longSide;
  if (edges.left) mm += shortSide;
  if (edges.right) mm += shortSide;
  return (mm * part.quantity) / 1000;
}

export function partBandedMetersByEdge(part: Part): Record<EdgeKey, number> {
  return {
    front: part.edges.front ? (part.cutLength * part.quantity) / 1000 : 0,
    back: part.edges.back ? (part.cutLength * part.quantity) / 1000 : 0,
    left: part.edges.left ? (part.cutWidth * part.quantity) / 1000 : 0,
    right: part.edges.right ? (part.cutWidth * part.quantity) / 1000 : 0,
  };
}

export function summarizeEdgeBanding(
  cabinets: Cabinet[],
): EdgeBandingTotal[] {
  const totals = new Map<string, number>();
  for (const cab of cabinets) {
    for (const part of cab.parts) {
      const byEdge = partBandedMetersByEdge(part);
      const each = (k: EdgeKey, m: number) => {
        const id = part.edges[k];
        if (!id || m <= 0) return;
        totals.set(id, (totals.get(id) ?? 0) + m);
      };
      each("front", byEdge.front);
      each("back", byEdge.back);
      each("left", byEdge.left);
      each("right", byEdge.right);
    }
  }
  return Array.from(totals.entries()).map(([id, meters]) => {
    const eb = getEdgeBanding(id);
    return {
      edgeBandingId: id,
      edgeBandingName: eb.name,
      meters,
      pricePerMeter: eb.pricePerMeter,
      cost: meters * eb.pricePerMeter,
    };
  });
}
