import { describe, expect, it } from "vitest";
import { buildCabinet, makeDefaultCabinet } from "../cabinets";
import { nest } from "../nesting";
import { sheetToDxf } from "../dxf";
import { sheetToGcode, DEFAULT_GCODE_OPTIONS } from "../postprocess/gcode";

describe("DXF output", () => {
  it("contains the required AC1009 header and SECTION blocks", () => {
    const cab = buildCabinet(makeDefaultCabinet("base", "x"));
    const sheets = nest([cab]);
    const dxf = sheetToDxf(sheets[0]);
    expect(dxf).toContain("AC1009");
    expect(dxf).toContain("SECTION");
    expect(dxf).toContain("ENTITIES");
    expect(dxf).toContain("EOF");
  });

  it("emits one LINE for each rectangle edge plus the sheet outline", () => {
    const cab = buildCabinet(makeDefaultCabinet("base", "x"));
    const sheets = nest([cab]);
    const dxf = sheetToDxf(sheets[0]);
    const lineCount = (dxf.match(/^0\nLINE/gm) ?? []).length;
    const expected = 4 + sheets[0].parts.length * 4;
    expect(lineCount).toBe(expected);
  });
});

describe("G-code output", () => {
  it("starts with absolute + units + spindle on, ends with spindle off + M30", () => {
    const cab = buildCabinet(makeDefaultCabinet("base", "x"));
    const sheets = nest([cab]);
    const nc = sheetToGcode(sheets[0]);
    const lines = nc.split("\n");
    expect(lines).toContain("G90");
    expect(lines).toContain("G21");
    expect(lines.some((l) => l.startsWith("M3 S"))).toBe(true);
    expect(lines).toContain("M5");
    expect(lines).toContain("M30");
  });

  it("contour cuts are kerf-offset outward by toolRadius", () => {
    const cab = buildCabinet(makeDefaultCabinet("base", "x"));
    const sheets = nest([cab]);
    const opts = { ...DEFAULT_GCODE_OPTIONS, toolDiameter: 6 };
    const nc = sheetToGcode(sheets[0], opts);
    // The first part's G0 move should land at (x - 3, y - 3).
    const first = sheets[0].parts[0];
    const targetX = (first.x - 3).toFixed(3);
    const targetY = (first.y - 3).toFixed(3);
    expect(nc).toContain(`G0 X${targetX} Y${targetY}`);
  });

  it("imperial mode emits G20", () => {
    const cab = buildCabinet(makeDefaultCabinet("base", "x"));
    const sheets = nest([cab]);
    const nc = sheetToGcode(sheets[0], {
      ...DEFAULT_GCODE_OPTIONS,
      units: "inch",
    });
    expect(nc.split("\n")).toContain("G20");
  });
});
