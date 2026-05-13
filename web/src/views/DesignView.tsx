import { useState } from "react";
import { Viewer3D } from "../components/Viewer3D";
import { RoomLayout2D } from "../components/RoomLayout2D";
import { CabinetInspector } from "../components/CabinetInspector";
import type { ProjectStore } from "../store";
import { makeDefaultCabinet } from "../domain/cabinets";
import { genId } from "../domain/project";

export function DesignView({ store }: { store: ProjectStore }) {
  const [pane, setPane] = useState<"3d" | "2d">("3d");
  const room = store.project.rooms[0];

  return (
    <div className="design-view">
      <div className="object-list">
        <h2>Cabinets</h2>
        <div className="object-actions">
          <button onClick={() => store.addCabinet(room.id, makeDefaultCabinet("base", genId()))}>+ Base</button>
          <button onClick={() => store.addCabinet(room.id, makeDefaultCabinet("wall", genId()))}>+ Wall</button>
          <button onClick={() => store.addCabinet(room.id, makeDefaultCabinet("tall", genId()))}>+ Tall</button>
        </div>
        <ul>
          {store.cabinetSpecs.map((c) => (
            <li
              key={c.id}
              className={c.id === store.selectedCabinetId ? "selected" : ""}
              onClick={() => store.setSelectedCabinetId(c.id)}
            >
              <span className={`kind-pill ${c.kind}`}>{c.kind[0].toUpperCase()}</span>
              {c.name}
              <span className="dim">{c.width}×{c.height}×{c.depth}</span>
            </li>
          ))}
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
          />
        ) : (
          <div className="empty-inspector">
            Select a cabinet to edit, or add one from the left.
          </div>
        )}
      </div>
    </div>
  );
}
