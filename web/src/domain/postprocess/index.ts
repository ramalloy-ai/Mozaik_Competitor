import type { Sheet } from "../nesting";
import { sheetToDxf } from "../dxf";
import { sheetToGcode, type GcodeOptions } from "./gcode";

export type PostprocessorId = "dxf" | "gcode-iso";

export interface Postprocessor {
  id: PostprocessorId;
  label: string;
  extension: string;
  mimeType: string;
  // True if the format is treated as a CAM-ready toolpath rather than a
  // 2D drawing — affects UI copy and download warnings.
  isToolpath: boolean;
  emit: (sheet: Sheet, options?: PostprocessorOptions) => string;
}

export interface PostprocessorOptions {
  gcode?: GcodeOptions;
}

const dxf: Postprocessor = {
  id: "dxf",
  label: "DXF (2D layout)",
  extension: "dxf",
  mimeType: "application/dxf",
  isToolpath: false,
  emit: (s) => sheetToDxf(s),
};

const gcodeIso: Postprocessor = {
  id: "gcode-iso",
  label: "G-code (generic ISO)",
  extension: "nc",
  mimeType: "text/plain",
  isToolpath: true,
  emit: (s, o) => sheetToGcode(s, o?.gcode),
};

export const POSTPROCESSORS: Postprocessor[] = [dxf, gcodeIso];

export function getPostprocessor(id: PostprocessorId): Postprocessor {
  const p = POSTPROCESSORS.find((p) => p.id === id);
  if (!p) throw new Error(`Unknown postprocessor: ${id}`);
  return p;
}

export { sheetToDxf, sheetToGcode };
export type { GcodeOptions };
