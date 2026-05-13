import { useEffect, useState } from "react";
import { Viewer3D } from "../components/Viewer3D";
import { RoomLayout2D } from "../components/RoomLayout2D";
import { CabinetInspector } from "../components/CabinetInspector";
import type { ProjectStore } from "../store";
import { makeDefaultCabinet } from "../domain/cabinets";
import { genId } from "../domain/project";
import type { CabinetKind } from "../domain/types";

const CABINET_TYPES: { kind: CabinetKind; label: string }[] = [
  { kind: "base", label: "Base" },
  { kind: "wall", label: "Wall" },
  { kind: "tall", label: "Tall" },
  { kind: "drawerBase", label: "Drawers" },
  { kind: "sinkBase", label: "Sink" },
  { kind: "cornerBase", label: "Corner" },
];

export function DesignView({ store }: { store: ProjectStore }) {
  const [pane, setPane] = useState<"3d" | "2d">("3d");
  const room = store.project.rooms[0];

  // Keyboard shortcuts: Delete to remove, arrows to nudge, Cmd/Ctrl+D to dup.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      const id = store.selectedCabinetId;
      if (!id) return;
      const sel = store.selectedSpec;
      if (!sel) return;
      const step = e.shiftKey ? 100 : 10;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        store.removeCabinet(id);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        store.duplicateCabinet(id);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        store.updateCabinet(id, { roomX: Math.max(0, sel.roomX - step) });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        store.updateCabinet(id, { roomX: sel.roomX + step });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        store.updateCabinet(id, { roomZ: Math.max(0, sel.roomZ - step) });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        store.updateCabinet(id, { roomZ: sel.roomZ + step });
      } else if (e.key === "Escape") {
        e.preventDefault();
        store.setSelectedCabinetId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [store]);

  return (
    <div className="design-view">
      <div className="object-list">
        <h2>Add cabinet</h2>
        <div className="object-actions">
          {CABINET_TYPES.map((t) => (
            <button
              key={t.kind}
              onClick={() =>
                store.addCabinet(room.id, makeDefaultCabinet(t.kind, genId()))
              }
            >
              + {t.label}
            </button>
          ))}
        </div>

        <h2 style={{ marginTop: 18 }}>
          Cabinets · {store.cabinetSpecs.length}
        </h2>
        <ul>
          {store.cabinetSpecs.map((c) => (
            <li
              key={c.id}
              className={c.id === store.selectedCabinetId ? "selected" : ""}
              onClick={() => store.setSelectedCabinetId(c.id)}
            >
              <span className={`kind-pill ${c.kind}`}>{c.kind[0].toUpperCase()}</span>
              {c.name}
              <span className="dim">{c.width}×{c.height}</span>
            </li>
          ))}
          {store.cabinetSpecs.length === 0 && (
            <li className="muted" style={{ cursor: "default" }}>None yet</li>
          )}
        </ul>
      </div>

      <div className="viewport">
        <div className="viewport-tabs">
          <button className={pane === "3d" ? "active" : ""} onClick={() => setPane("3d")}>3D</button>
          <button className={pane === "2d" ? "active" : ""} onClick={() => setPane("2d")}>Top-down</button>
        </div>
        <div className="viewport-body">
          {pane === "3d" ? (
            <Viewer3D
              room={room}
              cabinets={store.cabinets}
              selectedCabinetId={store.selectedCabinetId}
              onSelectCabinet={store.setSelectedCabinetId}
            />
          ) : (
            <RoomLayout2D
              room={room}
              selectedCabinetId={store.selectedCabinetId}
              onSelectCabinet={store.setSelectedCabinetId}
              onMoveCabinet={(id, x, z) =>
                store.updateCabinet(id, { roomX: x, roomZ: z })
              }
              onUpdateRoom={(patch) => store.updateRoom(room.id, patch)}
            />
          )}
        </div>
      </div>

      <div className="inspector-panel">
        {store.selectedSpec ? (
          <CabinetInspector
            spec={store.selectedSpec}
            onChange={(patch) =>
              store.updateCabinet(store.selectedSpec!.id, patch)
            }
            onDelete={() => store.removeCabinet(store.selectedSpec!.id)}
            onDuplicate={() => store.duplicateCabinet(store.selectedSpec!.id)}
          />
        ) : (
          <div className="empty-inspector">
            Select a cabinet to edit
            <br />
            <span className="muted small">
              Tips: drag in Top-down · arrows nudge · Cmd+D duplicates · Del removes
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
