import type { Sheet } from "../nesting";

export interface GcodeOptions {
  // Units (G20 inch / G21 mm). Default mm.
  units: "mm" | "inch";
  // Cutting feedrate (mm/min or in/min depending on units).
  feedRate: number;
  // Plunge feedrate.
  plungeRate: number;
  // Spindle speed (rpm).
  spindleRpm: number;
  // Safe Z above the stock for rapids.
  safeZ: number;
  // Cut depth below the stock surface (negative).
  cutZ: number;
  // Tool diameter; affects perimeter offset for through cuts.
  toolDiameter: number;
}

export const DEFAULT_GCODE_OPTIONS: GcodeOptions = {
  units: "mm",
  feedRate: 2500,
  plungeRate: 800,
  spindleRpm: 18000,
  safeZ: 10,
  cutZ: -19,
  toolDiameter: 6,
};

/**
 * Generic ISO G-code for sheet routing. Emits a perimeter contour per part,
 * offset outward by `toolDiameter / 2` so the saw kerf lands in the waste
 * rather than the part.
 *
 * This is a deliberately conservative baseline: no lead-in/lead-out, no
 * climb-vs-conventional handling, no tabs/bridges, single pass at full depth.
 * Treat the output as a starting point that any specific machine post will
 * still need to massage. Vendor-specific posts (Biesse BPP, Homag MPR, SCM
 * XXL) live behind the same `Postprocessor` interface.
 */
export function sheetToGcode(
  sheet: Sheet,
  options: GcodeOptions = DEFAULT_GCODE_OPTIONS,
): string {
  const o = { ...DEFAULT_GCODE_OPTIONS, ...options };
  const lines: string[] = [];
  const offset = o.toolDiameter / 2;

  lines.push(`( Sheet: ${sheet.materialName} )`);
  lines.push(
    `( ${sheet.sheetLength}${o.units === "mm" ? "mm" : '"'} x ${sheet.sheetWidth}${o.units === "mm" ? "mm" : '"'} )`,
  );
  lines.push(`( Utilization ${(sheet.utilization * 100).toFixed(1)}% )`);
  lines.push("G90"); // absolute
  lines.push(o.units === "mm" ? "G21" : "G20");
  lines.push("G17"); // XY plane
  lines.push(`M3 S${o.spindleRpm}`);
  lines.push(`G0 Z${o.safeZ.toFixed(3)}`);

  for (const np of sheet.parts) {
    const x0 = np.x - offset;
    const y0 = np.y - offset;
    const x1 = np.x + np.width + offset;
    const y1 = np.y + np.height + offset;

    lines.push(`( Part: ${np.part.cabinetName} / ${np.part.name} )`);
    lines.push(`G0 X${x0.toFixed(3)} Y${y0.toFixed(3)}`);
    lines.push(`G1 Z${o.cutZ.toFixed(3)} F${o.plungeRate}`);
    lines.push(`G1 X${x1.toFixed(3)} Y${y0.toFixed(3)} F${o.feedRate}`);
    lines.push(`G1 X${x1.toFixed(3)} Y${y1.toFixed(3)}`);
    lines.push(`G1 X${x0.toFixed(3)} Y${y1.toFixed(3)}`);
    lines.push(`G1 X${x0.toFixed(3)} Y${y0.toFixed(3)}`);
    lines.push(`G0 Z${o.safeZ.toFixed(3)}`);
  }

  lines.push("M5"); // spindle off
  lines.push("M30"); // program end
  return lines.join("\n");
}
