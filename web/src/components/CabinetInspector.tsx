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
  onDuplicate: () => void;
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

function CheckField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: "auto" }}
      />
    </div>
  );
}

export function CabinetInspector({ spec, onChange, onDelete, onDuplicate }: Props) {
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
        <button onClick={onDuplicate} title="Duplicate (Cmd/Ctrl+D)">Copy</button>
        <button className="danger" onClick={onDelete} title="Delete (Del)">Del</button>
      </div>

      <details className="inspector-section" open>
        <summary>Cabinet</summary>
        <div className="inspector-section-body">
          <div className="field">
            <label>Type</label>
            <select
              value={spec.kind}
              onChange={(e) => onChange({ kind: e.target.value as CabinetKind })}
            >
              <option value="base">Base</option>
              <option value="wall">Wall</option>
              <option value="tall">Tall</option>
              <option value="drawerBase">Drawer base</option>
              <option value="sinkBase">Sink base</option>
              <option value="cornerBase">Corner (blind)</option>
            </select>
          </div>
          <NumField label="Width" value={spec.width} min={150} max={1500} onChange={(v) => onChange({ width: v })} />
          <NumField label="Height" value={spec.height} min={200} max={2400} onChange={(v) => onChange({ height: v })} />
          <NumField label="Depth" value={spec.depth} min={150} max={900} onChange={(v) => onChange({ depth: v })} />
          <NumField label="Mount Y" value={spec.roomY} min={0} max={2400} onChange={(v) => onChange({ roomY: v })} />
        </div>
      </details>

      {spec.kind !== "wall" && (
        <details className="inspector-section">
          <summary>Toe Kick</summary>
          <div className="inspector-section-body">
            <NumField label="Height" value={spec.toeKickHeight} min={0} max={250} onChange={(v) => onChange({ toeKickHeight: v })} />
            <NumField label="Setback" value={spec.toeKickSetback} min={0} max={150} onChange={(v) => onChange({ toeKickSetback: v })} />
          </div>
        </details>
      )}

      <details className="inspector-section">
        <summary>Interior</summary>
        <div className="inspector-section-body">
          <NumField label="Shelves" value={spec.shelfCount} min={0} max={8} onChange={(v) => onChange({ shelfCount: v })} />
          <NumField label="Back inset" value={spec.backInset} min={0} max={50} onChange={(v) => onChange({ backInset: v })} />
        </div>
      </details>

      <details className="inspector-section">
        <summary>Front (doors / drawers)</summary>
        <div className="inspector-section-body">
          {spec.kind !== "drawerBase" && spec.kind !== "sinkBase" && (
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
          )}
          {spec.kind === "drawerBase" && (
            <NumField
              label="Drawer banks"
              value={spec.drawerCount}
              min={1}
              max={6}
              onChange={(v) => onChange({ drawerCount: v })}
            />
          )}
          <div className="field">
            <label>Door style</label>
            <select
              value={spec.doorStyleId}
              onChange={(e) => onChange({ doorStyleId: e.target.value })}
            >
              {Object.values(DOOR_STYLES).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <NumField label="Reveal gap" value={spec.doorGap} min={0} max={10} onChange={(v) => onChange({ doorGap: v })} />
          <CheckField
            label="Face frame"
            value={spec.faceFrame}
            onChange={(v) => onChange({ faceFrame: v })}
          />
          {spec.faceFrame && (
            <>
              <NumField label="Stile width" value={spec.faceFrameStileWidth} min={20} max={80} onChange={(v) => onChange({ faceFrameStileWidth: v })} />
              <NumField label="Rail width" value={spec.faceFrameRailWidth} min={20} max={80} onChange={(v) => onChange({ faceFrameRailWidth: v })} />
            </>
          )}
        </div>
      </details>

      {spec.kind === "tall" && (
        <details className="inspector-section">
          <summary>Tall doors</summary>
          <div className="inspector-section-body">
            <NumField label="Upper fraction" value={spec.tallUpperFraction} min={0} max={0.95} step={0.05} onChange={(v) => onChange({ tallUpperFraction: v })} />
            <NumField label="Mid gap" value={spec.tallDoorMidGap} min={0} max={20} onChange={(v) => onChange({ tallDoorMidGap: v })} />
          </div>
        </details>
      )}

      {spec.kind === "cornerBase" && (
        <details className="inspector-section">
          <summary>Corner geometry</summary>
          <div className="inspector-section-body">
            <NumField label="Blind width" value={spec.blindWidth} min={100} max={600} onChange={(v) => onChange({ blindWidth: v })} />
            <NumField label="Corner depth" value={spec.cornerDepth} min={300} max={1200} onChange={(v) => onChange({ cornerDepth: v })} />
          </div>
        </details>
      )}

      <details className="inspector-section">
        <summary>Materials</summary>
        <div className="inspector-section-body">
          <div className="field">
            <label>Carcass</label>
            <select value={spec.panelMaterialId} onChange={(e) => onChange({ panelMaterialId: e.target.value })}>
              {carcassMats.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Back</label>
            <select value={spec.backMaterialId} onChange={(e) => onChange({ backMaterialId: e.target.value })}>
              {backMats.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Doors</label>
            <select value={spec.doorMaterialId} onChange={(e) => onChange({ doorMaterialId: e.target.value })}>
              {doorMats.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Edge banding</label>
            <select value={spec.edgeBandingId} onChange={(e) => onChange({ edgeBandingId: e.target.value })}>
              {Object.values(EDGE_BANDINGS).map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
        </div>
      </details>

      <details className="inspector-section">
        <summary>Hardware</summary>
        <div className="inspector-section-body">
          <div className="field">
            <label>Hinges</label>
            <select value={spec.hingeId} onChange={(e) => onChange({ hingeId: e.target.value })}>
              {Object.values(HINGES).map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Pulls</label>
            <select value={spec.pullId} onChange={(e) => onChange({ pullId: e.target.value })}>
              {Object.values(PULLS).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          {(spec.doorStyle === "drawerFront" || spec.kind === "drawerBase") && (
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
        </div>
      </details>

      <details className="inspector-section">
        <summary>Joinery</summary>
        <div className="inspector-section-body">
          <div className="field">
            <label>Top/bottom</label>
            <select
              value={spec.joinery.topBottomToSides}
              onChange={(e) =>
                onChange({
                  joinery: { ...spec.joinery, topBottomToSides: e.target.value as "butt" | "dado" },
                })
              }
            >
              <option value="butt">Butt</option>
              <option value="dado">Dado</option>
            </select>
          </div>
          <div className="field">
            <label>Back</label>
            <select
              value={spec.joinery.backToCarcass}
              onChange={(e) =>
                onChange({
                  joinery: { ...spec.joinery, backToCarcass: e.target.value as "surface" | "rabbet" | "dado" },
                })
              }
            >
              <option value="surface">Surface</option>
              <option value="rabbet">Rabbet</option>
              <option value="dado">Dado</option>
            </select>
          </div>
          <NumField label="Groove depth" value={spec.joinery.grooveDepth} min={0} max={15} onChange={(v) => onChange({ joinery: { ...spec.joinery, grooveDepth: v } })} />
        </div>
      </details>

      <details className="inspector-section">
        <summary>Placement</summary>
        <div className="inspector-section-body">
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
      </details>
    </div>
  );
}
