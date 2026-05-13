import { useEffect, useRef, useState } from "react";
import type { CabinetSpec, Room, WallPoint } from "../domain/types";

interface Props {
  room: Room;
  selectedCabinetId: string | null;
  onSelectCabinet: (id: string | null) => void;
  onMoveCabinet: (id: string, x: number, z: number) => void;
  onUpdateRoom: (patch: Partial<Room>) => void;
}

type Tool = "select" | "wall";

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
  const [tool, setTool] = useState<Tool>("select");
  const [drafting, setDrafting] = useState<WallPoint[]>([]);
  const [hoverPoint, setHoverPoint] = useState<WallPoint | null>(null);
  const dragRef = useRef<{
    id: string;
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
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, size.w, size.h);
    ctx.fillStyle = "#f5f6f8";
    ctx.fillRect(0, 0, size.w, size.h);

    // Grid
    ctx.strokeStyle = "#e3e6eb";
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

    // Room boundary (always shown faintly)
    ctx.strokeStyle = "#c1c7d0";
    ctx.lineWidth = 1;
    ctx.strokeRect(padding, padding, room.widthX * scale, room.depthZ * scale);

    // Walls
    if (room.walls.length >= 2) {
      ctx.strokeStyle = "#2a2d33";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      for (let i = 0; i < room.walls.length; i++) {
        const p = room.walls[i];
        const px = padding + p.x * scale;
        const py = padding + p.z * scale;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      // Endpoint dots
      ctx.fillStyle = "#2a2d33";
      for (const p of room.walls) {
        ctx.beginPath();
        ctx.arc(padding + p.x * scale, padding + p.z * scale, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Drafting in-progress polyline
    if (drafting.length > 0) {
      ctx.strokeStyle = "#0ea5e9";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      for (let i = 0; i < drafting.length; i++) {
        const p = drafting[i];
        const px = padding + p.x * scale;
        const py = padding + p.z * scale;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      if (hoverPoint) {
        ctx.lineTo(padding + hoverPoint.x * scale, padding + hoverPoint.z * scale);
      }
      ctx.stroke();
      ctx.fillStyle = "#0ea5e9";
      for (const p of drafting) {
        ctx.beginPath();
        ctx.arc(padding + p.x * scale, padding + p.z * scale, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Cabinets
    for (const cab of room.cabinets) {
      const isSel = cab.id === selectedCabinetId;
      ctx.save();
      ctx.translate(padding + cab.roomX * scale, padding + cab.roomZ * scale);
      ctx.rotate(cab.roomRotation);
      const w = cab.width * scale;
      const d = cab.depth * scale;
      ctx.fillStyle =
        cab.kind === "wall"
          ? "#9fbfdb"
          : cab.kind === "tall"
            ? "#a18964"
            : cab.kind === "sinkBase"
              ? "#bdb097"
              : cab.kind === "drawerBase"
                ? "#b89464"
                : cab.kind === "cornerBase"
                  ? "#c4a373"
                  : "#c69968";
      ctx.fillRect(0, 0, w, d);
      ctx.strokeStyle = isSel ? "#0ea5e9" : "#0f1115";
      ctx.lineWidth = isSel ? 3 : 1.2;
      ctx.strokeRect(0, 0, w, d);

      // Front edge marker
      ctx.strokeStyle = "#0f1115";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, d);
      ctx.lineTo(w, d);
      ctx.stroke();

      ctx.fillStyle = "#0f1115";
      ctx.font = "12px -apple-system, sans-serif";
      ctx.fillText(cab.name, 6, 16);
      ctx.restore();
    }
  }, [room, selectedCabinetId, size, scale, drafting, hoverPoint]);

  const canvasToRoom = (clientX: number, clientY: number): WallPoint => {
    const rect = canvasRef.current!.getBoundingClientRect();
    let x = (clientX - rect.left - padding) / scale;
    let z = (clientY - rect.top - padding) / scale;
    // Snap to 10mm grid.
    x = Math.round(x / 10) * 10;
    z = Math.round(z / 10) * 10;
    return { x, z };
  };

  const hitTest = (rx: number, rz: number): CabinetSpec | null => {
    for (let i = room.cabinets.length - 1; i >= 0; i--) {
      const c = room.cabinets[i];
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

  const finishWalls = () => {
    if (drafting.length >= 2) {
      onUpdateRoom({ walls: drafting });
    }
    setDrafting([]);
    setHoverPoint(null);
    setTool("select");
  };

  const cancelWalls = () => {
    setDrafting([]);
    setHoverPoint(null);
    setTool("select");
  };

  useEffect(() => {
    if (tool !== "wall") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") finishWalls();
      if (e.key === "Escape") cancelWalls();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [tool, drafting]);

  return (
    <div ref={containerRef} className="layout2d">
      <div className="layout-toolbar">
        <div className="tool-group">
          <button
            className={tool === "select" ? "active" : ""}
            onClick={() => {
              setTool("select");
              setDrafting([]);
            }}
          >
            Select
          </button>
          <button
            className={tool === "wall" ? "active" : ""}
            onClick={() => {
              setTool("wall");
              setDrafting([]);
            }}
          >
            Draw walls
          </button>
        </div>
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
        {room.walls.length > 0 && (
          <button onClick={() => onUpdateRoom({ walls: [] })}>
            Clear walls
          </button>
        )}
        <span className="hint">
          {tool === "select"
            ? "click to select · drag to move"
            : "click to add point · Enter to finish · Esc to cancel"}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        style={{
          flex: 1,
          cursor:
            tool === "wall"
              ? "crosshair"
              : dragRef.current
                ? "grabbing"
                : "default",
        }}
        onMouseDown={(e) => {
          const p = canvasToRoom(e.clientX, e.clientY);
          if (tool === "wall") {
            setDrafting((d) => [...d, p]);
            return;
          }
          const cab = hitTest(p.x, p.z);
          if (cab) {
            onSelectCabinet(cab.id);
            const dxw = p.x - cab.roomX;
            const dzw = p.z - cab.roomZ;
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
          const p = canvasToRoom(e.clientX, e.clientY);
          if (tool === "wall") {
            setHoverPoint(p);
            return;
          }
          if (!dragRef.current) return;
          const { localX, localZ, rotation } = dragRef.current;
          const cos = Math.cos(rotation);
          const sin = Math.sin(rotation);
          const worldOffsetX = localX * cos - localZ * sin;
          const worldOffsetZ = localX * sin + localZ * cos;
          onMoveCabinet(
            dragRef.current.id,
            Math.max(0, p.x - worldOffsetX),
            Math.max(0, p.z - worldOffsetZ),
          );
        }}
        onMouseUp={() => {
          dragRef.current = null;
        }}
        onMouseLeave={() => {
          dragRef.current = null;
          setHoverPoint(null);
        }}
        onDoubleClick={() => {
          if (tool === "wall") finishWalls();
        }}
      />
    </div>
  );
}
