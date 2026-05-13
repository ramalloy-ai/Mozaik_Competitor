import { describe, expect, it } from "vitest";
import { buildCabinet, makeDefaultCabinet } from "../cabinets";
import { partBandedMeters, summarizeEdgeBanding } from "../edgeBanding";

describe("edge banding", () => {
  it("banded meters = sum of banded edge lengths in meters", () => {
    const cab = buildCabinet(makeDefaultCabinet("base", "x"));
    const door = cab.parts.find((p) => p.name === "Door (Left)")!;
    // All four edges are banded on the door.
    const expected = (2 * door.cutLength + 2 * door.cutWidth) / 1000;
    expect(partBandedMeters(door)).toBeCloseTo(expected, 5);
  });

  it("summary aggregates by edge-banding product", () => {
    const cab = buildCabinet(makeDefaultCabinet("base", "x"));
    const totals = summarizeEdgeBanding([cab]);
    expect(totals.length).toBeGreaterThan(0);
    for (const t of totals) {
      expect(t.meters).toBeGreaterThan(0);
      expect(t.cost).toBeGreaterThan(0);
      expect(t.cost).toBeCloseTo(t.meters * t.pricePerMeter, 5);
    }
  });

  it("part with no banded edges contributes zero", () => {
    const cab = buildCabinet(makeDefaultCabinet("base", "x"));
    const back = cab.parts.find((p) => p.name === "Back Panel")!;
    expect(partBandedMeters(back)).toBe(0);
  });
});
