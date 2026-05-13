import { describe, expect, it } from "vitest";
import { buildCabinet, makeDefaultCabinet } from "../cabinets";

describe("drawer base cabinet", () => {
  it("emits drawer fronts and drawer boxes per bank", () => {
    const cab = buildCabinet(makeDefaultCabinet("drawerBase", "d1"));
    const fronts = cab.parts.filter((p) => p.name.startsWith("Drawer Front"));
    const sidesL = cab.parts.filter((p) => p.name.startsWith("Drawer Side (L)"));
    const sidesR = cab.parts.filter((p) => p.name.startsWith("Drawer Side (R)"));
    const backs = cab.parts.filter((p) => p.name.startsWith("Drawer Back"));
    const bottoms = cab.parts.filter((p) => p.name.startsWith("Drawer Bottom"));
    expect(fronts).toHaveLength(3);
    expect(sidesL).toHaveLength(3);
    expect(sidesR).toHaveLength(3);
    expect(backs).toHaveLength(3);
    expect(bottoms).toHaveLength(3);
  });

  it("respects drawerCount", () => {
    const spec = makeDefaultCabinet("drawerBase", "d2");
    spec.drawerCount = 5;
    const cab = buildCabinet(spec);
    expect(
      cab.parts.filter((p) => p.name.startsWith("Drawer Front")),
    ).toHaveLength(5);
  });
});

describe("sink base cabinet", () => {
  it("has a false drawer front and double doors but no shelf or floor", () => {
    const cab = buildCabinet(makeDefaultCabinet("sinkBase", "s1"));
    const names = cab.parts.map((p) => p.name);
    expect(names).toContain("False Drawer Front (Sink)");
    expect(names).toContain("Door (Left)");
    expect(names).toContain("Door (Right)");
    expect(names).not.toContain("Bottom");
  });
});

describe("corner base cabinet", () => {
  it("has a blind filler and a single shelf", () => {
    const cab = buildCabinet(makeDefaultCabinet("cornerBase", "c1"));
    const names = cab.parts.map((p) => p.name);
    expect(names).toContain("Blind Filler");
    expect(names).toContain("Right Partition");
    const shelves = cab.parts.filter((p) => p.name === "Shelf");
    expect(shelves).toHaveLength(1);
  });
});

describe("face frame", () => {
  it("adds 4 face-frame parts when faceFrame=true", () => {
    const base = buildCabinet(makeDefaultCabinet("base", "b1"));
    const baseFF = buildCabinet({
      ...makeDefaultCabinet("base", "b2"),
      faceFrame: true,
    });
    const ffPartsCount = baseFF.parts.length - base.parts.length;
    expect(ffPartsCount).toBe(4);
    const names = baseFF.parts.map((p) => p.name);
    expect(names).toContain("Face Frame Stile (Left)");
    expect(names).toContain("Face Frame Stile (Right)");
    expect(names).toContain("Face Frame Rail (Bottom)");
    expect(names).toContain("Face Frame Rail (Top)");
  });

  it("shrinks the door opening by stile/rail widths", () => {
    const noFF = buildCabinet(makeDefaultCabinet("base", "b1"));
    const withFF = buildCabinet({
      ...makeDefaultCabinet("base", "b2"),
      faceFrame: true,
    });
    const doorNo = noFF.parts.find((p) => p.name === "Door (Left)")!;
    const doorWith = withFF.parts.find((p) => p.name === "Door (Left)")!;
    expect(doorWith.cutWidth).toBeLessThan(doorNo.cutWidth);
    expect(doorWith.cutLength).toBeLessThan(doorNo.cutLength);
  });
});
