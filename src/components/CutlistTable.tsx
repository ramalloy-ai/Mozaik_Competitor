import type { CutlistRow } from "../domain/types";
import { totalBoardArea } from "../domain/cutlist";

interface Props {
  rows: CutlistRow[];
}

export function CutlistTable({ rows }: Props) {
  const area = totalBoardArea(rows);
  return (
    <div className="panel right">
      <h2>Cut List</h2>
      <table className="cutlist-table">
        <thead>
          <tr>
            <th>Part</th>
            <th>Material</th>
            <th className="num">L</th>
            <th className="num">W</th>
            <th className="num">T</th>
            <th className="num">Qty</th>
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
            </tr>
          ))}
        </tbody>
      </table>
      <div className="cutlist-summary">
        Total board area: <strong>{area.toFixed(3)} m²</strong>
        <br />
        Parts: <strong>{rows.reduce((s, r) => s + r.quantity, 0)}</strong>
      </div>
    </div>
  );
}
