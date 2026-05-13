import { describe, expect, it } from "vitest";
import { buildCabinet, makeDefaultCabinet } from "../cabinets";
import type { CabinetSpec } from "../types";

function defaultSpec(kind: CabinetSpec["kind"]): CabinetSpec {
  return makeDefaultCabinet(kind, `${kind}-test`);
}

describe("base cabinet generator", () => {
  it("emits the expected named parts for a default base", () => {
    const cab = buildCabinet(defaultSpec("base"));
    const names = new Set(cab.parts.map((p) => p.name));
    expect(names).toContain("Left Side");
    expect(names).toContain("Right Side");
    expect(names).toContain("Bottom");
    expect(names).toContain("Top Stretcher (Front)");
    expect(names).toContain("Top Stretcher (Back)");
    expect(names).toContain("Toe Kick");
    expect(names).toContain("Back Panel");
    expect(names).toContain("Shelf 1");
    expect(names).toContain("Door (Left)");
    expect(names).toContain("Door (Right)");
  });

  it("each part carries cabinet identity", () => {
    const cab = buildCabinet(defaultSpec("base"));
    for (const p of cab.parts) {
      expect(p.cabinetId).toBe(cab.spec.id);
      expect(p.cabinetName).toBe(cab.spec.name);
    }
  });

  it("doors get edge banding on all four edges", () => {
    const cab = buildCabinet(defaultSpec("base"));
    const door = cab.parts.find((p) => p.name === "Door (Left)")!;
    expect(door.edges.front).toBeDefined();
    expect(door.edges.back).toBeDefined();
    expect(door.edges.left).toBeDefined();
    expect(door.edges.right).toBeDefined();
  });

  it("rabbet back joinery boosts the back panel cut size", () => {
    const surface: CabinetSpec = {
      ...defaultSpec("base"),
      joinery: { topBottomToSides: "butt", backToCarcass: "surface", grooveDepth: 8 },
    };
    const rabbet: CabinetSpec = {
      ...defaultSpec("base"),
      joinery: { topBottomToSides: "butt", backToCarcass: "rabbet", grooveDepth: 8 },
    };
    const a = buildCabinet(surface).parts.find((p) => p.name === "Back Panel")!;
    const b = buildCabinet(rabbet).parts.find((p) => p.name === "Back Panel")!;
    expect(b.cutLength - a.cutLength).toBe(16);
    expect(b.cutWidth - a.cutWidth).toBe(16);
    // World box size unchanged — extra material extends into rabbets.
    expect(b.size).toEqual(a.size);
  });

  it("dadoed bottom/top/shelves extend into the side panels", () => {
    const butt = buildCabinet({
      ...defaultSpec("base"),
      joinery: { topBottomToSides: "butt", backToCarcass: "surface", grooveDepth: 8 },
    });
    const dado = buildCabinet({
      ...defaultSpec("base"),
      joinery: { topBottomToSides: "dado", backToCarcass: "surface", grooveDepth: 8 },
    });
    const buttBottom = butt.parts.find((p) => p.name === "Bottom")!;
    const dadoBottom = dado.parts.find((p) => p.name === "Bottom")!;
    expect(dadoBottom.cutLength - buttBottom.cutLength).toBe(16);
    const buttShelf = butt.parts.find((p) => p.name === "Shelf 1")!;
    const dadoShelf = dado.parts.find((p) => p.name === "Shelf 1")!;
    expect(dadoShelf.cutLength - buttShelf.cutLength).toBe(16);
  });
});

describe("wall cabinet generator", () => {
  it("has no toe kick, has a top panel", () => {
    const cab = buildCabinet(defaultSpec("wall"));
    const names = cab.parts.map((p) => p.name);
    expect(names).not.toContain("Toe Kick");
    expect(names).toContain("Top");
  });
});

describe("tall cabinet generator", () => {
  it("split doors produce four door parts when doorStyle=double", () => {
    const cab = buildCabinet({
      ...defaultSpec("tall"),
      tallUpperFraction: 0.7,
    });
    const doors = cab.parts.filter((p) => p.name.startsWith("Door"));
    expect(doors).toHaveLength(4);
    const upperLeft = doors.find((d) => d.name === "Door (Left Upper)")!;
    const lowerLeft = doors.find((d) => d.name === "Door (Left Lower)")!;
    expect(upperLeft).toBeDefined();
    expect(lowerLeft).toBeDefined();
    expect(upperLeft.cutLength).toBeGreaterThan(lowerLeft.cutLength);
  });

  it("tallUpperFraction=0 produces two full-height doors", () => {
    const cab = buildCabinet({
      ...defaultSpec("tall"),
      tallUpperFraction: 0,
    });
    const doors = cab.parts.filter((p) => p.name.startsWith("Door"));
    expect(doors).toHaveLength(2);
  });

  it("upper + lower door heights + mid gap fit the door area", () => {
    const spec = { ...defaultSpec("tall"), tallUpperFraction: 0.6 };
    const cab = buildCabinet(spec);
    const upper = cab.parts.find((p) => p.name === "Door (Left Upper)")!;
    const lower = cab.parts.find((p) => p.name === "Door (Left Lower)")!;
    const doorAreaH = spec.height - spec.toeKickHeight - 2 * spec.doorGap;
    const sum = upper.cutLength + lower.cutLength + spec.tallDoorMidGap;
    expect(sum).toBeCloseTo(doorAreaH, 3);
  });
});
