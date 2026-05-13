import { useEffect, useMemo, useState } from "react";
import type { CabinetSpec, Room } from "./domain/types";
import { allCabinets, makeDefaultProject, type Project } from "./domain/project";
import { buildCabinet } from "./domain/cabinets";

const STORAGE_KEY = "cs-project";

function migrateCabinet(c: CabinetSpec): CabinetSpec {
  return {
    ...c,
    joinery:
      c.joinery ?? {
        topBottomToSides: "butt",
        backToCarcass: "rabbet",
        grooveDepth: 8,
      },
    tallUpperFraction:
      c.tallUpperFraction ?? (c.kind === "tall" ? 0.7 : 0),
    tallDoorMidGap: c.tallDoorMidGap ?? 3,
  };
}

function migrateProject(p: Project): Project {
  return {
    ...p,
    rooms: p.rooms.map((r) => ({
      ...r,
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
  const [project, setProject] = useState<Project>(() => loadProject());
  const [selectedCabinetId, setSelectedCabinetId] = useState<string | null>(
    () => project.rooms[0]?.cabinets[0]?.id ?? null,
  );
  const [serverProjectId, setServerProjectId] = useState<string | null>(null);

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

  const updateCabinet = (id: string, patch: Partial<CabinetSpec>) => {
    setProject((p) => ({
      ...p,
      rooms: p.rooms.map((r) => ({
        ...r,
        cabinets: r.cabinets.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      })),
    }));
  };

  const addCabinet = (roomId: string, spec: CabinetSpec) => {
    setProject((p) => ({
      ...p,
      rooms: p.rooms.map((r) =>
        r.id === roomId ? { ...r, cabinets: [...r.cabinets, spec] } : r,
      ),
    }));
    setSelectedCabinetId(spec.id);
  };

  const removeCabinet = (id: string) => {
    setProject((p) => ({
      ...p,
      rooms: p.rooms.map((r) => ({
        ...r,
        cabinets: r.cabinets.filter((c) => c.id !== id),
      })),
    }));
    if (selectedCabinetId === id) setSelectedCabinetId(null);
  };

  const updateRoom = (id: string, patch: Partial<Room>) => {
    setProject((p) => ({
      ...p,
      rooms: p.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  };

  const updatePricing = (patch: Partial<Project["pricing"]>) => {
    setProject((p) => ({ ...p, pricing: { ...p.pricing, ...patch } }));
  };

  const updateMeta = (patch: { name?: string; customer?: string }) => {
    setProject((p) => ({ ...p, ...patch }));
  };

  const replace = (next: Project, serverId: string | null) => {
    const migrated = migrateProject(next);
    setProject(migrated);
    setServerProjectId(serverId);
    setSelectedCabinetId(migrated.rooms[0]?.cabinets[0]?.id ?? null);
  };

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
    updateRoom,
    updatePricing,
    updateMeta,
    serverProjectId,
    setServerProjectId,
    replace,
  };
}

export type ProjectStore = ReturnType<typeof useProject>;
