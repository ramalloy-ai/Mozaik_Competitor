import { useEffect, useRef, useState } from "react";
import type { CabinetSpec, Room } from "../domain/types";

interface Props {
  room: Room;
  selectedCabinetId: string | null;
  onSelectCabinet: (id: string | null) => void;
  onMoveCabinet: (id: string, x: number, z: number) => void;
  onUpdateRoom: (patch: Partial<Room>) => void;
}

// Top-down 2D plan: X horizontal, Z vertical (depth). Origin top-left of
// the canvas maps to room (0,0).
export function RoomLayout2D({
  room,
  selectedCabinetId,
  onSelectCabinet,
  onMoveCabinet,
  onUpdateRoom,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const dragRef = useRef<{
    id: string;
    // Local-frame offset from cabinet origin to the clicked point.
    localX: number;
    localZ: number;
    rotation: number;
  } | null>(null);

  useEffect(() => {
    const el = containerRef.current!;
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Fit room into canvas with padding.
  const padding = 40;
  const scale = Math.min(
    (size.w - padding * 2) / Math.max(room.widthX, 1),
    (size.h - padding * 2) / Math.max(room.depthZ, 1),
  );

  useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.width = size.w * window.devicePixelRatio;
    canvas.height = size.h * window.devicePixelRatio;
    canvas.style.width = `${size.w}px`;
    canvas.style.height = `${size.h}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, size.w, size.h);
    ctx.fillStyle = "#0f1115";
    ctx.fillRect(0, 0, size.w, size.h);

    // Grid lines every 100mm.
    ctx.strokeStyle = "#1f2228";
    ctx.lineWidth = 1;
    for (let x = 0; x <= room.widthX; x += 100) {
      const px = padding + x * scale;
      ctx.beginPath();
      ctx.moveTo(px, padding);
      ctx.lineTo(px, padding + room.depthZ * scale);
      ctx.stroke();
    }
    for (let z = 0; z <= room.depthZ; z += 100) {
      const py = padding + z * scale;
      ctx.beginPath();
      ctx.moveTo(padding, py);
      ctx.lineTo(padding + room.widthX * scale, py);
      ctx.stroke();
    }

    // Room outline.
    ctx.strokeStyle = "#3a3f47";
    ctx.lineWidth = 2;
    ctx.strokeRect(padding, padding, room.widthX * scale, room.depthZ * scale);

    // Cabinets.
    for (const cab of room.cabinets) {
      const isSel = cab.id === selectedCabinetId;
      ctx.save();
      ctx.translate(padding + cab.roomX * scale, padding + cab.roomZ * scale);
      ctx.rotate(cab.roomRotation);
      const w = cab.width * scale;
      const d = cab.depth * scale;
      ctx.fillStyle =
        cab.kind === "base"
          ? "#d9b382"
          : cab.kind === "wall"
            ? "#a8c4e3"
            : "#caa472";
      ctx.globalAlpha = 0.85;
      ctx.fillRect(0, 0, w, d);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = isSel ? "#7dd3fc" : "#15171b";
      ctx.lineWidth = isSel ? 3 : 1.5;
      ctx.strokeRect(0, 0, w, d);

      // Front edge marker (toward +Z = bottom in plan).
      ctx.strokeStyle = "#15171b";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, d);
      ctx.lineTo(w, d);
      ctx.stroke();

      ctx.fillStyle = "#15171b";
      ctx.font = "12px -apple-system, sans-serif";
      ctx.fillText(cab.name, 6, 16);
      ctx.restore();
    }
  }, [room, selectedCabinetId, size, scale]);

  const canvasToRoom = (clientX: number, clientY: number) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = (clientX - rect.left - padding) / scale;
    const z = (clientY - rect.top - padding) / scale;
    return { x, z };
  };

  const hitTest = (rx: number, rz: number): CabinetSpec | null => {
    for (let i = room.cabinets.length - 1; i >= 0; i--) {
      const c = room.cabinets[i];
      // Transform the click point into the cabinet's local frame: undo the
      // translation, then rotate by -roomRotation.
      const dx = rx - c.roomX;
      const dz = rz - c.roomZ;
      const cos = Math.cos(-c.roomRotation);
      const sin = Math.sin(-c.roomRotation);
      const lx = dx * cos - dz * sin;
      const lz = dx * sin + dz * cos;
      if (lx >= 0 && lx <= c.width && lz >= 0 && lz <= c.depth) return c;
    }
    return null;
  };

  return (
    <div ref={containerRef} className="layout2d">
      <div className="layout-toolbar">
        <label>
          Room W:
          <input
            type="number"
            value={room.widthX}
            min={1000}
            max={20000}
            step={100}
            onChange={(e) => onUpdateRoom({ widthX: Number(e.target.value) })}
          />
        </label>
        <label>
          Room D:
          <input
            type="number"
            value={room.depthZ}
            min={1000}
            max={20000}
            step={100}
            onChange={(e) => onUpdateRoom({ depthZ: Number(e.target.value) })}
          />
        </label>
        <span className="hint">click to select · drag to move · mm</span>
      </div>
      <canvas
        ref={canvasRef}
        style={{ flex: 1, cursor: dragRef.current ? "grabbing" : "default" }}
        onMouseDown={(e) => {
          const { x, z } = canvasToRoom(e.clientX, e.clientY);
          const cab = hitTest(x, z);
          if (cab) {
            onSelectCabinet(cab.id);
            const dxw = x - cab.roomX;
            const dzw = z - cab.roomZ;
            const cos = Math.cos(-cab.roomRotation);
            const sin = Math.sin(-cab.roomRotation);
            dragRef.current = {
              id: cab.id,
              localX: dxw * cos - dzw * sin,
              localZ: dxw * sin + dzw * cos,
              rotation: cab.roomRotation,
            };
          } else {
            onSelectCabinet(null);
          }
        }}
        onMouseMove={(e) => {
          if (!dragRef.current) return;
          const { x, z } = canvasToRoom(e.clientX, e.clientY);
          const { localX, localZ, rotation } = dragRef.current;
          const cos = Math.cos(rotation);
          const sin = Math.sin(rotation);
          const worldOffsetX = localX * cos - localZ * sin;
          const worldOffsetZ = localX * sin + localZ * cos;
          const newX = Math.max(0, Math.round((x - worldOffsetX) / 10) * 10);
          const newZ = Math.max(0, Math.round((z - worldOffsetZ) / 10) * 10);
          onMoveCabinet(dragRef.current.id, newX, newZ);
        }}
        onMouseUp={() => {
          dragRef.current = null;
        }}
        onMouseLeave={() => {
          dragRef.current = null;
        }}
      />
    </div>
  );
}
