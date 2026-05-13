// Minimal DXF R12 writer. Sufficient for sheet-nest plates and part outlines,
// which is what most CAM postprocessors accept as a layout interchange format.

import type { Sheet } from "./nesting";
import type { Part } from "./types";

function header(): string[] {
  return [
    "0", "SECTION",
    "2", "HEADER",
    "9", "$ACADVER",
    "1", "AC1009",
    "9", "$INSUNITS",
    "70", "4", // millimeters
    "0", "ENDSEC",
  ];
}

function tables(layers: string[]): string[] {
  const out = [
    "0", "SECTION",
    "2", "TABLES",
    "0", "TABLE",
    "2", "LAYER",
    "70", String(layers.length),
  ];
  for (const layer of layers) {
    out.push(
      "0", "LAYER",
      "2", layer,
      "70", "0",
      "62", "7",
      "6", "CONTINUOUS",
    );
  }
  out.push("0", "ENDTAB", "0", "ENDSEC");
  return out;
}

function line(layer: string, x1: number, y1: number, x2: number, y2: number): string[] {
  return [
    "0", "LINE",
    "8", layer,
    "10", x1.toFixed(3),
    "20", y1.toFixed(3),
    "30", "0",
    "11", x2.toFixed(3),
    "21", y2.toFixed(3),
    "31", "0",
  ];
}

function text(layer: string, x: number, y: number, value: string, height = 14): string[] {
  return [
    "0", "TEXT",
    "8", layer,
    "10", x.toFixed(3),
    "20", y.toFixed(3),
    "30", "0",
    "40", height.toFixed(3),
    "1", value,
  ];
}

function rectangle(layer: string, x: number, y: number, w: number, h: number): string[] {
  return [
    ...line(layer, x, y, x + w, y),
    ...line(layer, x + w, y, x + w, y + h),
    ...line(layer, x + w, y + h, x, y + h),
    ...line(layer, x, y + h, x, y),
  ];
}

export function sheetToDxf(sheet: Sheet): string {
  const entities: string[] = [
    "0", "SECTION",
    "2", "ENTITIES",
  ];
  entities.push(...rectangle("SHEET", 0, 0, sheet.sheetLength, sheet.sheetWidth));
  for (const np of sheet.parts) {
    entities.push(
      ...rectangle("PARTS", np.x, np.y, np.width, np.height),
      ...text("LABELS", np.x + 12, np.y + 12, `${np.part.cabinetName} / ${np.part.name}`, 18),
    );
  }
  entities.push("0", "ENDSEC", "0", "EOF");
  return [
    ...header(),
    ...tables(["SHEET", "PARTS", "LABELS"]),
    ...entities,
  ].join("\n");
}

export function partToDxf(part: Part): string {
  const w = part.cutLength;
  const h = part.cutWidth;
  const entities: string[] = [
    "0", "SECTION",
    "2", "ENTITIES",
    ...rectangle("PART", 0, 0, w, h),
    ...text("LABEL", 12, 12, `${part.cabinetName} / ${part.name}`, 24),
    "0", "ENDSEC",
    "0", "EOF",
  ];
  return [...header(), ...tables(["PART", "LABEL"]), ...entities].join("\n");
}

export function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/dxf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
