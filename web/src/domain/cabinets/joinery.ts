import type { CabinetSpec } from "../types";

export interface JoineryDeltas {
  // mm to add to the length of bottom / top / shelf so they reach into dadoes
  // machined into the sides.
  topBottomLengthBoost: number;
  // mm to add to the back panel length (to seat into sides) and height (to
  // seat into top/bottom).
  backLengthBoost: number;
  backHeightBoost: number;
}

export function joineryDeltas(spec: CabinetSpec): JoineryDeltas {
  const d = spec.joinery.grooveDepth;
  const topBottomLengthBoost =
    spec.joinery.topBottomToSides === "dado" ? 2 * d : 0;
  const back = spec.joinery.backToCarcass;
  const backLengthBoost = back === "rabbet" || back === "dado" ? 2 * d : 0;
  const backHeightBoost = back === "rabbet" || back === "dado" ? 2 * d : 0;
  return { topBottomLengthBoost, backLengthBoost, backHeightBoost };
}
