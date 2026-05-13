import type { Cabinet, CabinetSpec } from "./types";
import type { Sheet } from "./nesting";
import {
  getDrawerSlide,
  getHinge,
  getMaterial,
  getPull,
  type SheetMaterial,
} from "./library";
import { summarizeEdgeBanding } from "./edgeBanding";

export interface PricingInputs {
  laborRatePerSquareMeter: number;
  hardwareMarkup: number;
  overallMarkup: number;
  taxRate: number;
}

export interface PriceLine {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

export interface PriceTotal {
  lines: PriceLine[];
  subtotal: number;
  markup: number;
  preTax: number;
  tax: number;
  total: number;
}

function sheetCountByMaterial(sheets: Sheet[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const s of sheets) {
    m.set(s.materialId, (m.get(s.materialId) ?? 0) + 1);
  }
  return m;
}

function hardwareForCabinet(spec: CabinetSpec): PriceLine[] {
  const lines: PriceLine[] = [];
  // Hinges: one pair per door leaf.
  const doorLeaves =
    spec.doorStyle === "double" ? 2 : spec.doorStyle === "single" ? 1 : 0;
  if (doorLeaves > 0) {
    const hinge = getHinge(spec.hingeId);
    const pairs = doorLeaves;
    const qty = pairs * 2;
    lines.push({
      description: `${hinge.name} (for ${spec.name})`,
      quantity: qty,
      unit: "ea",
      unitPrice: hinge.pricePerUnit,
      amount: qty * hinge.pricePerUnit,
    });
    // Pulls: one per door leaf.
    const pull = getPull(spec.pullId);
    lines.push({
      description: `${pull.name} pull (for ${spec.name})`,
      quantity: doorLeaves,
      unit: "ea",
      unitPrice: pull.pricePerUnit,
      amount: doorLeaves * pull.pricePerUnit,
    });
  }
  if (spec.doorStyle === "drawerFront" && spec.drawerSlideId) {
    const slide = getDrawerSlide(spec.drawerSlideId);
    lines.push({
      description: `${slide.name} pair (for ${spec.name})`,
      quantity: 1,
      unit: "pr",
      unitPrice: slide.pricePerPair,
      amount: slide.pricePerPair,
    });
  }
  return lines;
}

export function buildPriceQuote(
  cabinets: Cabinet[],
  sheets: Sheet[],
  inputs: PricingInputs,
): PriceTotal {
  const lines: PriceLine[] = [];

  // Sheet stock
  const counts = sheetCountByMaterial(sheets);
  for (const [matId, qty] of counts) {
    const mat: SheetMaterial = getMaterial(matId);
    lines.push({
      description: `${mat.name} sheet (${mat.sheetLength}×${mat.sheetWidth}mm)`,
      quantity: qty,
      unit: "sht",
      unitPrice: mat.pricePerSheet,
      amount: qty * mat.pricePerSheet,
    });
  }

  // Edge banding
  for (const eb of summarizeEdgeBanding(cabinets)) {
    lines.push({
      description: `${eb.edgeBandingName} edge banding`,
      quantity: Number(eb.meters.toFixed(2)),
      unit: "m",
      unitPrice: eb.pricePerMeter,
      amount: eb.cost,
    });
  }

  // Hardware
  const hardwareLinesByDesc = new Map<string, PriceLine>();
  for (const cab of cabinets) {
    for (const line of hardwareForCabinet(cab.spec)) {
      const existing = hardwareLinesByDesc.get(line.description);
      if (existing) {
        existing.quantity += line.quantity;
        existing.amount += line.amount;
      } else {
        hardwareLinesByDesc.set(line.description, { ...line });
      }
    }
  }
  for (const line of hardwareLinesByDesc.values()) {
    // Apply hardware markup separately.
    line.unitPrice = line.unitPrice * (1 + inputs.hardwareMarkup);
    line.amount = line.quantity * line.unitPrice;
    lines.push(line);
  }

  // Labor: based on total face area of cabinets (m²).
  const faceArea = cabinets.reduce(
    (sum, c) => sum + (c.spec.width * c.spec.height) / 1_000_000,
    0,
  );
  lines.push({
    description: "Shop labor (sizing, edge banding, assembly)",
    quantity: Number(faceArea.toFixed(2)),
    unit: "m²",
    unitPrice: inputs.laborRatePerSquareMeter,
    amount: faceArea * inputs.laborRatePerSquareMeter,
  });

  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  const markup = subtotal * inputs.overallMarkup;
  const preTax = subtotal + markup;
  const tax = preTax * inputs.taxRate;
  const total = preTax + tax;
  return { lines, subtotal, markup, preTax, tax, total };
}
