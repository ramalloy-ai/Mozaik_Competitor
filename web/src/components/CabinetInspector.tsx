import type { CabinetSpec, DoorStyle, CabinetKind } from "../domain/types";
import {
  DOOR_STYLES,
  DRAWER_SLIDES,
  EDGE_BANDINGS,
  HINGES,
  PULLS,
  SHEET_MATERIALS,
} from "../domain/library";

interface Props {
  spec: CabinetSpec;
  onChange: (patch: Partial<CabinetSpec>) => void;
  onDelete: () => void;
}

function NumField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step ?? 1}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function CabinetInspector({ spec, onChange, onDelete }: Props) {
  const carcassMats = Object.values(SHEET_MATERIALS).filter(
    (m) => m.kind === "carcass",
  );
  const backMats = Object.values(SHEET_MATERIALS).filter(
    (m) => m.kind === "back" || m.kind === "carcass",
  );
  const doorMats = Object.values(SHEET_MATERIALS).filter(
    (m) => m.kind === "door" || m.kind === "carcass",
  );

  return (
    <div className="inspector">
      <div className="inspector-header">
        <input
          value={spec.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="name-input"
        />
        <button className="danger" onClick={onDelete}>
          Delete
        </button>
      </div>

      <div className="field">
        <label>Type</label>
        <select
          value={spec.kind}
          onChange={(e) => onChange({ kind: e.target.value as CabinetKind })}
        >
          <option value="base">Base</option>
          <option value="wall">Wall</option>
          <option value="tall">Tall</option>
        </select>
      </div>

      <h3>Dimensions (mm)</h3>
      <NumField label="Width" value={spec.width} min={150} max={1200} onChange={(v) => onChange({ width: v })} />
      <NumField label="Height" value={spec.height} min={200} max={2400} onChange={(v) => onChange({ height: v })} />
      <NumField label="Depth" value={spec.depth} min={150} max={900} onChange={(v) => onChange({ depth: v })} />
      <NumField label="Mount Y" value={spec.roomY} min={0} max={2400} onChange={(v) => onChange({ roomY: v })} />

      {spec.kind !== "wall" && (
        <>
          <h3>Toe Kick</h3>
          <NumField label="Height" value={spec.toeKickHeight} min={0} max={250} onChange={(v) => onChange({ toeKickHeight: v })} />
          <NumField label="Setback" value={spec.toeKickSetback} min={0} max={150} onChange={(v) => onChange({ toeKickSetback: v })} />
        </>
      )}

      <h3>Interior</h3>
      <NumField label="Shelves" value={spec.shelfCount} min={0} max={8} onChange={(v) => onChange({ shelfCount: v })} />
      <NumField label="Back Inset" value={spec.backInset} min={0} max={50} onChange={(v) => onChange({ backInset: v })} />

      <h3>Doors / Drawers</h3>
      <div className="field">
        <label>Layout</label>
        <select
          value={spec.doorStyle}
          onChange={(e) => onChange({ doorStyle: e.target.value as DoorStyle })}
        >
          <option value="none">None</option>
          <option value="single">Single door</option>
          <option value="double">Double door</option>
          <option value="drawerFront">Drawer front</option>
        </select>
      </div>
      <div className="field">
        <label>Style</label>
        <select
          value={spec.doorStyleId}
          onChange={(e) => onChange({ doorStyleId: e.target.value })}
        >
          {Object.values(DOOR_STYLES).map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <NumField label="Reveal Gap" value={spec.doorGap} min={0} max={10} onChange={(v) => onChange({ doorGap: v })} />

      <h3>Materials</h3>
      <div className="field">
        <label>Carcass</label>
        <select value={spec.panelMaterialId} onChange={(e) => onChange({ panelMaterialId: e.target.value })}>
          {carcassMats.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Back</label>
        <select value={spec.backMaterialId} onChange={(e) => onChange({ backMaterialId: e.target.value })}>
          {backMats.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Doors</label>
        <select value={spec.doorMaterialId} onChange={(e) => onChange({ doorMaterialId: e.target.value })}>
          {doorMats.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Edge banding</label>
        <select value={spec.edgeBandingId} onChange={(e) => onChange({ edgeBandingId: e.target.value })}>
          {Object.values(EDGE_BANDINGS).map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
      </div>

      <h3>Hardware</h3>
      <div className="field">
        <label>Hinges</label>
        <select value={spec.hingeId} onChange={(e) => onChange({ hingeId: e.target.value })}>
          {Object.values(HINGES).map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Pulls</label>
        <select value={spec.pullId} onChange={(e) => onChange({ pullId: e.target.value })}>
          {Object.values(PULLS).map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      {spec.doorStyle === "drawerFront" && (
        <div className="field">
          <label>Drawer slides</label>
          <select
            value={spec.drawerSlideId ?? ""}
            onChange={(e) =>
              onChange({ drawerSlideId: e.target.value || null })
            }
          >
            <option value="">— none —</option>
            {Object.values(DRAWER_SLIDES).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      <h3>Joinery</h3>
      <div className="field">
        <label>Bottom/top to sides</label>
        <select
          value={spec.joinery.topBottomToSides}
          onChange={(e) =>
            onChange({
              joinery: {
                ...spec.joinery,
                topBottomToSides: e.target.value as "butt" | "dado",
              },
            })
          }
        >
          <option value="butt">Butt</option>
          <option value="dado">Dado</option>
        </select>
      </div>
      <div className="field">
        <label>Back attachment</label>
        <select
          value={spec.joinery.backToCarcass}
          onChange={(e) =>
            onChange({
              joinery: {
                ...spec.joinery,
                backToCarcass: e.target.value as
                  | "surface"
                  | "rabbet"
                  | "dado",
              },
            })
          }
        >
          <option value="surface">Surface (recessed)</option>
          <option value="rabbet">Rabbet</option>
          <option value="dado">Dado</option>
        </select>
      </div>
      <NumField
        label="Groove depth"
        value={spec.joinery.grooveDepth}
        min={0}
        max={15}
        onChange={(v) =>
          onChange({ joinery: { ...spec.joinery, grooveDepth: v } })
        }
      />

      {spec.kind === "tall" && (
        <>
          <h3>Tall doors</h3>
          <NumField
            label="Upper portion (0–1, 0 = single)"
            value={spec.tallUpperFraction}
            min={0}
            max={0.95}
            step={0.05}
            onChange={(v) => onChange({ tallUpperFraction: v })}
          />
          <NumField
            label="Mid gap"
            value={spec.tallDoorMidGap}
            min={0}
            max={20}
            onChange={(v) => onChange({ tallDoorMidGap: v })}
          />
        </>
      )}

      <h3>Placement</h3>
      <NumField label="X" value={spec.roomX} min={0} max={20000} step={10} onChange={(v) => onChange({ roomX: v })} />
      <NumField label="Z" value={spec.roomZ} min={0} max={20000} step={10} onChange={(v) => onChange({ roomZ: v })} />
      <NumField
        label="Rotation°"
        value={Math.round((spec.roomRotation * 180) / Math.PI)}
        min={0}
        max={359}
        step={15}
        onChange={(v) => onChange({ roomRotation: (v * Math.PI) / 180 })}
      />
    </div>
  );
}
