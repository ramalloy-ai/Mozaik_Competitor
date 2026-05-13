import type { Cabinet, CabinetSpec } from "../types";
import { buildBase } from "./base";
import { buildWall } from "./wall";
import { buildTall } from "./tall";

export function buildCabinet(spec: CabinetSpec): Cabinet {
  switch (spec.kind) {
    case "base":
      return buildBase(spec);
    case "wall":
      return buildWall(spec);
    case "tall":
      return buildTall(spec);
  }
}

export function makeDefaultCabinet(
  kind: CabinetSpec["kind"],
  id: string,
): CabinetSpec {
  const common = {
    id,
    panelMaterialId: "ply18",
    backMaterialId: "ply6",
    doorMaterialId: "mdf18",
    edgeBandingId: "pvc1mmMaple",
    doorStyleId: "slab",
    hingeId: "blum110",
    pullId: "bar128",
    shelfCount: 1,
    doorStyle: "double" as const,
    doorGap: 3,
    backInset: 12,
    roomX: 0,
    roomZ: 0,
    roomRotation: 0,
  };
  switch (kind) {
    case "base":
      return {
        ...common,
        name: "Base 600",
        kind: "base",
        width: 600,
        height: 870,
        depth: 580,
        toeKickHeight: 100,
        toeKickSetback: 60,
        drawerSlideId: null,
        roomY: 0,
      };
    case "wall":
      return {
        ...common,
        name: "Wall 600",
        kind: "wall",
        width: 600,
        height: 720,
        depth: 320,
        toeKickHeight: 0,
        toeKickSetback: 0,
        drawerSlideId: null,
        shelfCount: 2,
        roomY: 1450,
      };
    case "tall":
      return {
        ...common,
        name: "Tall 600",
        kind: "tall",
        width: 600,
        height: 2100,
        depth: 580,
        toeKickHeight: 100,
        toeKickSetback: 60,
        drawerSlideId: null,
        shelfCount: 4,
        roomY: 0,
      };
  }
}
