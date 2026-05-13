import { useMemo } from "react";
import type { ProjectStore } from "../store";
import { buildCutlist, totalBoardArea } from "../domain/cutlist";
import { summarizeEdgeBanding } from "../domain/edgeBanding";

async function downloadLabels(
  cabinets: Parameters<typeof import("../domain/pdf").generateLabelsPdf>[0],
  rows: Parameters<typeof import("../domain/pdf").generateLabelsPdf>[1],
  filename: string,
) {
  const pdf = await import("../domain/pdf");
  pdf.downloadBlob(filename, pdf.generateLabelsPdf(cabinets, rows));
}

export function CutlistView({ store }: { store: ProjectStore }) {
  const rows = useMemo(() => buildCutlist(store.cabinets), [store.cabinets]);
  const banding = useMemo(
    () => summarizeEdgeBanding(store.cabinets),
    [store.cabinets],
  );
  const area = totalBoardArea(rows);
  const totalParts = rows.reduce((s, r) => s + r.quantity, 0);

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Cut list</h1>
        <div>
          <button
            onClick={() =>
              downloadLabels(
                store.cabinets,
                rows,
                `${store.project.name}-labels.pdf`,
              )
            }
          >
            Download part labels (PDF)
          </button>
        </div>
      </div>

      <div className="screen-body">
        <table className="data-table">
          <thead>
            <tr>
              <th>Part</th>
              <th>Material</th>
              <th className="num">L</th>
              <th className="num">W</th>
              <th className="num">T</th>
              <th className="num">Qty</th>
              <th className="num">Banded m</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.partName}</td>
                <td>{r.materialName}</td>
                <td className="num">{r.length}</td>
                <td className="num">{r.width}</td>
                <td className="num">{r.thickness}</td>
                <td className="num">{r.quantity}</td>
                <td className="num">{r.edgeBandedMeters.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="totals-grid">
          <div>
            <strong>Total board area</strong>
            <div>{area.toFixed(2)} m²</div>
          </div>
          <div>
            <strong>Parts</strong>
            <div>{totalParts}</div>
          </div>
          <div>
            <strong>Edge banding</strong>
            <div>
              {banding.map((b) => (
                <div key={b.edgeBandingId}>
                  {b.edgeBandingName}: {b.meters.toFixed(2)} m
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
