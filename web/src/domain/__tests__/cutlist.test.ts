import { describe, expect, it } from "vitest";
import { buildCabinet, makeDefaultCabinet } from "../cabinets";
import { buildCutlist, totalBoardArea } from "../cutlist";

describe("cutlist", () => {
  it("dedupes identical parts and sums quantity", () => {
    const cabs = [
      buildCabinet(makeDefaultCabinet("base", "a")),
      buildCabinet(makeDefaultCabinet("base", "b")),
    ];
    const rows = buildCutlist(cabs);
    const leftSide = rows.find((r) => r.partName === "Left Side")!;
    expect(leftSide.quantity).toBe(2);
  });

  it("totalBoardArea is positive and finite", () => {
    const cab = buildCabinet(makeDefaultCabinet("base", "x"));
    const rows = buildCutlist([cab]);
    const area = totalBoardArea(rows);
    expect(area).toBeGreaterThan(0);
    expect(Number.isFinite(area)).toBe(true);
  });

  it("sorts by material then by descending length", () => {
    const cab = buildCabinet(makeDefaultCabinet("base", "x"));
    const rows = buildCutlist([cab]);
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].materialName === rows[i - 1].materialName) {
        expect(rows[i].length).toBeLessThanOrEqual(rows[i - 1].length);
      }
    }
  });

  it("includes edge-banded meters per row", () => {
    const cab = buildCabinet(makeDefaultCabinet("base", "x"));
    const rows = buildCutlist([cab]);
    const door = rows.find((r) => r.partName === "Door (Left)")!;
    expect(door.edgeBandedMeters).toBeGreaterThan(0);
  });
});
