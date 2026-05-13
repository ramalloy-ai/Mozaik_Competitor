import type { BaseCabinetSpec, DoorStyle } from "../domain/types";
import { MATERIALS } from "../domain/materials";

interface Props {
  spec: BaseCabinetSpec;
  onChange: (next: BaseCabinetSpec) => void;
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

export function Controls({ spec, onChange }: Props) {
  const set = <K extends keyof BaseCabinetSpec>(
    key: K,
    value: BaseCabinetSpec[K],
  ) => onChange({ ...spec, [key]: value });

  return (
    <div className="panel">
      <h2>Dimensions (mm)</h2>
      <NumField label="Width" value={spec.width} min={150} max={1200} onChange={(v) => set("width", v)} />
      <NumField label="Height" value={spec.height} min={300} max={2400} onChange={(v) => set("height", v)} />
      <NumField label="Depth" value={spec.depth} min={200} max={900} onChange={(v) => set("depth", v)} />

      <h2 style={{ marginTop: 18 }}>Toe Kick</h2>
      <NumField label="Height" value={spec.toeKickHeight} min={0} max={250} onChange={(v) => set("toeKickHeight", v)} />
      <NumField label="Setback" value={spec.toeKickSetback} min={0} max={150} onChange={(v) => set("toeKickSetback", v)} />

      <h2 style={{ marginTop: 18 }}>Interior</h2>
      <NumField label="Shelves" value={spec.shelfCount} min={0} max={6} onChange={(v) => set("shelfCount", v)} />
      <NumField label="Back Inset" value={spec.backInset} min={0} max={50} onChange={(v) => set("backInset", v)} />

      <h2 style={{ marginTop: 18 }}>Doors</h2>
      <div className="field">
        <label>Style</label>
        <select
          value={spec.doorStyle}
          onChange={(e) => set("doorStyle", e.target.value as DoorStyle)}
        >
          <option value="none">None</option>
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="drawerFront">Drawer front</option>
        </select>
      </div>
      <NumField label="Reveal Gap" value={spec.doorGap} min={0} max={10} onChange={(v) => set("doorGap", v)} />

      <h2 style={{ marginTop: 18 }}>Materials</h2>
      <div className="field">
        <label>Carcass</label>
        <select value={spec.panelMaterialId} onChange={(e) => set("panelMaterialId", e.target.value)}>
          {Object.values(MATERIALS).map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Back</label>
        <select value={spec.backMaterialId} onChange={(e) => set("backMaterialId", e.target.value)}>
          {Object.values(MATERIALS).map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Doors</label>
        <select value={spec.doorMaterialId} onChange={(e) => set("doorMaterialId", e.target.value)}>
          {Object.values(MATERIALS).map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
