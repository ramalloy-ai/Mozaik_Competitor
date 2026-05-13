import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CabinetSpec, Room } from "./domain/types";
import {
  allCabinets,
  genId,
  makeDefaultProject,
  type Project,
} from "./domain/project";
import { buildCabinet } from "./domain/cabinets";

const STORAGE_KEY = "cs-project";
const HISTORY_LIMIT = 60;

const MATERIAL_ALIAS: Record<string, string> = {
  ply18: "ply18Maple",
  ply6: "ply6Maple",
};

function migrateCabinet(c: CabinetSpec): CabinetSpec {
  return {
    ...c,
    panelMaterialId: MATERIAL_ALIAS[c.panelMaterialId] ?? c.panelMaterialId,
    backMaterialId: MATERIAL_ALIAS[c.backMaterialId] ?? c.backMaterialId,
    doorMaterialId: MATERIAL_ALIAS[c.doorMaterialId] ?? c.doorMaterialId,
    joinery:
      c.joinery ?? {
        topBottomToSides: "butt",
        backToCarcass: "rabbet",
        grooveDepth: 8,
      },
    tallUpperFraction:
      c.tallUpperFraction ?? (c.kind === "tall" ? 0.7 : 0),
    tallDoorMidGap: c.tallDoorMidGap ?? 3,
    faceFrame: c.faceFrame ?? false,
    faceFrameStileWidth: c.faceFrameStileWidth ?? 38,
    faceFrameRailWidth: c.faceFrameRailWidth ?? 38,
    drawerCount: c.drawerCount ?? 3,
    cornerDepth: c.cornerDepth ?? 580,
    blindWidth: c.blindWidth ?? 300,
  };
}

function migrateProject(p: Project): Project {
  return {
    ...p,
    rooms: p.rooms.map((r) => ({
      ...r,
      walls: r.walls ?? [],
      wallHeight: r.wallHeight ?? 2400,
      cabinets: r.cabinets.map(migrateCabinet),
    })),
  };
}

function loadProject(): Project {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrateProject(JSON.parse(raw) as Project);
  } catch {
    // ignore
  }
  return makeDefaultProject();
}

export function useProject() {
  const [project, setProjectState] = useState<Project>(() => loadProject());
  const [selectedCabinetId, setSelectedCabinetId] = useState<string | null>(
    () => project.rooms[0]?.cabinets[0]?.id ?? null,
  );
  const [serverProjectId, setServerProjectId] = useState<string | null>(null);

  // Undo/redo history.
  const past = useRef<Project[]>([]);
  const future = useRef<Project[]>([]);
  const [, forceHistoryRender] = useState(0);
  const refreshHistoryUi = () => forceHistoryRender((n) => n + 1);

  const setProject = useCallback(
    (
      updater: Project | ((prev: Project) => Project),
      opts: { recordHistory?: boolean } = { recordHistory: true },
    ) => {
      setProjectState((prev) => {
        const next =
          typeof updater === "function"
            ? (updater as (p: Project) => Project)(prev)
            : updater;
        if (opts.recordHistory) {
          past.current.push(prev);
          if (past.current.length > HISTORY_LIMIT) past.current.shift();
          future.current = [];
          refreshHistoryUi();
        }
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  }, [project]);

  const cabinetSpecs = useMemo(() => allCabinets(project), [project]);
  const cabinets = useMemo(
    () => cabinetSpecs.map(buildCabinet),
    [cabinetSpecs],
  );
  const selectedSpec = useMemo(
    () => cabinetSpecs.find((c) => c.id === selectedCabinetId) ?? null,
    [cabinetSpecs, selectedCabinetId],
  );

  const updateCabinet = useCallback(
    (
      id: string,
      patch: Partial<CabinetSpec>,
      opts?: { recordHistory?: boolean },
    ) => {
      setProject(
        (p) => ({
          ...p,
          rooms: p.rooms.map((r) => ({
            ...r,
            cabinets: r.cabinets.map((c) =>
              c.id === id ? { ...c, ...patch } : c,
            ),
          })),
        }),
        { recordHistory: opts?.recordHistory ?? true },
      );
    },
    [setProject],
  );

  const addCabinet = useCallback(
    (roomId: string, spec: CabinetSpec) => {
      setProject((p) => ({
        ...p,
        rooms: p.rooms.map((r) =>
          r.id === roomId ? { ...r, cabinets: [...r.cabinets, spec] } : r,
        ),
      }));
      setSelectedCabinetId(spec.id);
    },
    [setProject],
  );

  const removeCabinet = useCallback(
    (id: string) => {
      setProject((p) => ({
        ...p,
        rooms: p.rooms.map((r) => ({
          ...r,
          cabinets: r.cabinets.filter((c) => c.id !== id),
        })),
      }));
      setSelectedCabinetId((sel) => (sel === id ? null : sel));
    },
    [setProject],
  );

  const duplicateCabinet = useCallback(
    (id: string) => {
      let newId: string | null = null;
      setProject((p) => ({
        ...p,
        rooms: p.rooms.map((r) => {
          const idx = r.cabinets.findIndex((c) => c.id === id);
          if (idx < 0) return r;
          const source = r.cabinets[idx];
          newId = genId();
          const copy: CabinetSpec = {
            ...source,
            id: newId,
            name: `${source.name} (copy)`,
            roomX: source.roomX + 50,
            roomZ: source.roomZ + 50,
          };
          return { ...r, cabinets: [...r.cabinets, copy] };
        }),
      }));
      if (newId) setSelectedCabinetId(newId);
    },
    [setProject],
  );

  const updateRoom = useCallback(
    (id: string, patch: Partial<Room>) => {
      setProject((p) => ({
        ...p,
        rooms: p.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      }));
    },
    [setProject],
  );

  const updatePricing = useCallback(
    (patch: Partial<Project["pricing"]>) => {
      setProject((p) => ({ ...p, pricing: { ...p.pricing, ...patch } }));
    },
    [setProject],
  );

  const updateMeta = useCallback(
    (patch: { name?: string; customer?: string }) => {
      setProject((p) => ({ ...p, ...patch }));
    },
    [setProject],
  );

  const replace = useCallback((next: Project, serverId: string | null) => {
    const migrated = migrateProject(next);
    past.current = [];
    future.current = [];
    setProjectState(migrated);
    setServerProjectId(serverId);
    setSelectedCabinetId(migrated.rooms[0]?.cabinets[0]?.id ?? null);
    refreshHistoryUi();
  }, []);

  const undo = useCallback(() => {
    setProjectState((current) => {
      const prev = past.current.pop();
      if (!prev) return current;
      future.current.push(current);
      refreshHistoryUi();
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setProjectState((current) => {
      const next = future.current.pop();
      if (!next) return current;
      past.current.push(current);
      refreshHistoryUi();
      return next;
    });
  }, []);

  return {
    project,
    setProject,
    cabinetSpecs,
    cabinets,
    selectedCabinetId,
    setSelectedCabinetId,
    selectedSpec,
    updateCabinet,
    addCabinet,
    removeCabinet,
    duplicateCabinet,
    updateRoom,
    updatePricing,
    updateMeta,
    serverProjectId,
    setServerProjectId,
    replace,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  };
}

export type ProjectStore = ReturnType<typeof useProject>;
