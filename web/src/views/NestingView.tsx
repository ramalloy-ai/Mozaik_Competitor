import { useMemo, useState } from "react";
import type { ProjectStore } from "../store";
import { nest, type Sheet } from "../domain/nesting";
import { downloadText } from "../domain/dxf";
import {
  POSTPROCESSORS,
  getPostprocessor,
  type PostprocessorId,
} from "../domain/postprocess";

export function NestingView({ store }: { store: ProjectStore }) {
  const [kerf, setKerf] = useState(3);
  const [postId, setPostId] = useState<PostprocessorId>("dxf");
  const post = getPostprocessor(postId);
  const sheets = useMemo(
    () => nest(store.cabinets, kerf),
    [store.cabinets, kerf],
  );

  const downloadSheet = (sheet: Sheet, index: number) => {
    downloadText(
      `sheet-${index}-${sheet.materialId}.${post.extension}`,
      post.emit(sheet),
    );
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Sheet nesting</h1>
        <div className="screen-controls">
          <label>
            Kerf:
            <input
              type="number"
              value={kerf}
              min={0}
              max={10}
              step={0.1}
              onChange={(e) => setKerf(Number(e.target.value))}
            />
          </label>
          <label>
            Output:
            <select
              value={postId}
              onChange={(e) => setPostId(e.target.value as PostprocessorId)}
            >
              {POSTPROCESSORS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </label>
          <span className="hint">{sheets.length} sheets</span>
        </div>
      </div>
      <div className="screen-body">
        {post.isToolpath && (
          <div className="warning-banner">
            G-code output is a generic ISO baseline (single-pass perimeter,
            kerf-offset outward). Validate against your machine before cutting:
            no tabs, no lead-ins, no climb-vs-conventional logic.
          </div>
        )}
        {sheets.map((sheet, i) => (
          <SheetView
            key={i}
            index={i + 1}
            sheet={sheet}
            onDownload={() => downloadSheet(sheet, i + 1)}
            downloadLabel={`Download ${post.extension.toUpperCase()}`}
          />
        ))}
      </div>
    </div>
  );
}

function SheetView({
  index,
  sheet,
  onDownload,
  downloadLabel,
}: {
  index: number;
  sheet: Sheet;
  onDownload: () => void;
  downloadLabel: string;
}) {
  const px = 0.4;
  return (
    <div className="sheet-card">
      <div className="sheet-card-header">
        <strong>
          Sheet #{index} — {sheet.materialName}
        </strong>
        <span>
          {sheet.sheetLength}×{sheet.sheetWidth}mm · util{" "}
          {(sheet.utilization * 100).toFixed(1)}%
        </span>
        <button onClick={onDownload}>{downloadLabel}</button>
      </div>
      <svg
        className="sheet-svg"
        viewBox={`0 0 ${sheet.sheetLength} ${sheet.sheetWidth}`}
        style={{ width: sheet.sheetLength * px, height: sheet.sheetWidth * px }}
      >
        <rect
          x={0}
          y={0}
          width={sheet.sheetLength}
          height={sheet.sheetWidth}
          fill="#15171b"
          stroke="#3a3f47"
          strokeWidth={3}
        />
        {sheet.parts.map((np, j) => (
          <g key={j} transform={`translate(${np.x},${np.y})`}>
            <rect
              width={np.width}
              height={np.height}
              fill="#d9b382"
              stroke="#15171b"
              strokeWidth={2}
              opacity={0.85}
            />
            <text
              x={Math.min(np.width / 2, 12)}
              y={28}
              fill="#15171b"
              fontSize={Math.min(36, np.height / 4)}
              fontFamily="sans-serif"
            >
              {np.part.cabinetName.slice(0, 12)} / {np.part.name}
            </text>
            <text
              x={Math.min(np.width / 2, 12)}
              y={28 + Math.min(40, np.height / 4)}
              fill="#15171b"
              fontSize={Math.min(36, np.height / 4)}
              fontFamily="sans-serif"
            >
              {Math.round(np.width)}×{Math.round(np.height)}
              {np.rotated ? " (R)" : ""}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
