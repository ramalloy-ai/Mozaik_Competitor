import { describe, expect, it } from "vitest";
import { buildCabinet, makeDefaultCabinet } from "../cabinets";
import { nest, type Sheet } from "../nesting";

function totalPartsInBuckets(cabs: ReturnType<typeof buildCabinet>[]): number {
  return cabs.reduce(
    (sum, c) => sum + c.parts.reduce((s, p) => s + p.quantity, 0),
    0,
  );
}

function totalNested(sheets: Sheet[]): number {
  return sheets.reduce((s, sheet) => s + sheet.parts.length, 0);
}

function partsOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

describe("nesting", () => {
  const cabs = [
    buildCabinet(makeDefaultCabinet("base", "c1")),
    buildCabinet(makeDefaultCabinet("wall", "c2")),
    buildCabinet(makeDefaultCabinet("tall", "c3")),
  ];

  it("nests every part across one or more sheets", () => {
    const sheets = nest(cabs, 3);
    expect(totalNested(sheets)).toBe(totalPartsInBuckets(cabs));
  });

  it("each part fits inside its sheet bounds", () => {
    const sheets = nest(cabs, 3);
    for (const sheet of sheets) {
      for (const np of sheet.parts) {
        expect(np.x).toBeGreaterThanOrEqual(0);
        expect(np.y).toBeGreaterThanOrEqual(0);
        expect(np.x + np.width).toBeLessThanOrEqual(sheet.sheetLength + 0.01);
        expect(np.y + np.height).toBeLessThanOrEqual(sheet.sheetWidth + 0.01);
      }
    }
  });

  it("no two parts on a sheet overlap (accounting for kerf)", () => {
    const kerf = 3;
    const sheets = nest(cabs, kerf);
    for (const sheet of sheets) {
      for (let i = 0; i < sheet.parts.length; i++) {
        for (let j = i + 1; j < sheet.parts.length; j++) {
          const a = sheet.parts[i];
          const b = sheet.parts[j];
          // Inflate parts by half-kerf on each side to recreate the kerf gap
          // and check for overlap of the kerf-aware bounds.
          const inflate = kerf / 2;
          const ainf = {
            x: a.x - inflate,
            y: a.y - inflate,
            width: a.width + 2 * inflate,
            height: a.height + 2 * inflate,
          };
          const binf = {
            x: b.x - inflate,
            y: b.y - inflate,
            width: b.width + 2 * inflate,
            height: b.height + 2 * inflate,
          };
          // Strict overlap means the *cores* of the items collide, which is
          // what we forbid; touching is permitted.
          expect(partsOverlap(ainf, binf)).toBe(false);
        }
      }
    }
  });

  it("utilization is between 0 and 1 on every sheet", () => {
    const sheets = nest(cabs, 3);
    for (const s of sheets) {
      expect(s.utilization).toBeGreaterThan(0);
      expect(s.utilization).toBeLessThanOrEqual(1);
    }
  });

  it("grain-locked parts retain length axis on the sheet", () => {
    const sheets = nest(cabs, 3);
    for (const sheet of sheets) {
      for (const np of sheet.parts) {
        if (np.part.material.hasGrain && np.part.grain === "length") {
          expect(np.rotated).toBe(false);
        }
      }
    }
  });
});
