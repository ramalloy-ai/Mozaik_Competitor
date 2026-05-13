import jsPDF from "jspdf";
import type { Cabinet, CutlistRow } from "./types";
import type { PriceTotal } from "./pricing";

function currency(n: number) {
  return `$${n.toFixed(2)}`;
}

export function generateQuotePdf(opts: {
  projectName: string;
  customer: string;
  quote: PriceTotal;
}): Blob {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 48;
  let y = margin;

  doc.setFontSize(20);
  doc.text("Cabinet Studio — Quote", margin, y);
  y += 26;
  doc.setFontSize(11);
  doc.text(`Project: ${opts.projectName}`, margin, y);
  y += 14;
  doc.text(`Customer: ${opts.customer || "—"}`, margin, y);
  y += 14;
  doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, y);
  y += 24;

  doc.setFontSize(10);
  const colX = [margin, margin + 260, margin + 330, margin + 380, margin + 460];
  doc.setFont("helvetica", "bold");
  doc.text("Description", colX[0], y);
  doc.text("Qty", colX[1], y);
  doc.text("Unit", colX[2], y);
  doc.text("Unit Price", colX[3], y);
  doc.text("Amount", colX[4], y);
  y += 6;
  doc.setLineWidth(0.5);
  doc.line(margin, y, 612 - margin, y);
  y += 10;
  doc.setFont("helvetica", "normal");

  for (const line of opts.quote.lines) {
    if (y > 720) {
      doc.addPage();
      y = margin;
    }
    doc.text(line.description.slice(0, 50), colX[0], y);
    doc.text(String(line.quantity), colX[1], y);
    doc.text(line.unit, colX[2], y);
    doc.text(currency(line.unitPrice), colX[3], y);
    doc.text(currency(line.amount), colX[4], y);
    y += 14;
  }

  y += 6;
  doc.line(margin, y, 612 - margin, y);
  y += 14;
  const totals: [string, number][] = [
    ["Subtotal", opts.quote.subtotal],
    ["Markup", opts.quote.markup],
    ["Tax", opts.quote.tax],
    ["Total", opts.quote.total],
  ];
  for (const [label, val] of totals) {
    doc.text(label, colX[3], y);
    doc.text(currency(val), colX[4], y);
    y += 14;
  }

  return doc.output("blob");
}

export function generateLabelsPdf(
  cabinets: Cabinet[],
  cutlist: CutlistRow[],
): Blob {
  // 3x10 label sheet (Avery 5160 layout), letter portrait.
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = 612;
  const margin = 36;
  const cols = 3;
  const rows = 10;
  const labelW = (pageWidth - margin * 2) / cols;
  const labelH = (792 - margin * 2) / rows;

  let labelIndex = 0;
  const place = (lines: string[]) => {
    const col = labelIndex % cols;
    const row = Math.floor(labelIndex / cols) % rows;
    if (labelIndex > 0 && labelIndex % (cols * rows) === 0) {
      doc.addPage();
    }
    const x = margin + col * labelW + 6;
    let y = margin + row * labelH + 18;
    doc.setFontSize(10);
    for (const line of lines.slice(0, 4)) {
      doc.text(line, x, y);
      y += 12;
    }
    labelIndex++;
  };

  // One label per physical part (expanded by quantity).
  for (const cab of cabinets) {
    for (const part of cab.parts) {
      for (let i = 0; i < part.quantity; i++) {
        const banded = Object.entries(part.edges)
          .filter(([, v]) => v)
          .map(([k]) => k[0].toUpperCase())
          .join("");
        place([
          cab.spec.name,
          part.name,
          `${Math.round(part.cutLength)} × ${Math.round(
            part.cutWidth,
          )} × ${part.cutThickness}`,
          `Edges: ${banded || "—"}`,
        ]);
      }
    }
  }

  // Suppress unused-parameter warning while keeping the API stable.
  void cutlist;
  return doc.output("blob");
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
