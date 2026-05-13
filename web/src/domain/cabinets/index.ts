import type { Cabinet, CabinetSpec } from "../types";
import { buildBase } from "./base";
import { buildWall } from "./wall";
import { buildTall } from "./tall";
import { buildDrawerBase } from "./drawerBase";
import { buildSinkBase } from "./sinkBase";
import { buildCornerBase } from "./cornerBase";

export function buildCabinet(spec: CabinetSpec): Cabinet {
  switch (spec.kind) {
    case "base":
      return buildBase(spec);
    case "wall":
      return buildWall(spec);
    case "tall":
      return buildTall(spec);
    case "drawerBase":
      return buildDrawerBase(spec);
    case "sinkBase":
      return buildSinkBase(spec);
    case "cornerBase":
      return buildCornerBase(spec);
  }
}

export function makeDefaultCabinet(
  kind: CabinetSpec["kind"],
  id: string,
): CabinetSpec {
  const common = {
    id,
    panelMaterialId: "ply18Maple",
    backMaterialId: "ply6Maple",
    doorMaterialId: "mdf18",
    edgeBandingId: "pvc1mmMaple",
    doorStyleId: "shaker",
    hingeId: "blum110",
    pullId: "bar128",
    shelfCount: 1,
    doorStyle: "double" as const,
    doorGap: 3,
    backInset: 12,
    joinery: {
      topBottomToSides: "butt" as const,
      backToCarcass: "rabbet" as const,
      grooveDepth: 8,
    },
    tallUpperFraction: 0,
    tallDoorMidGap: 3,
    faceFrame: false,
    faceFrameStileWidth: 38,
    faceFrameRailWidth: 38,
    drawerCount: 3,
    cornerDepth: 580,
    blindWidth: 300,
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
        tallUpperFraction: 0.7,
        roomY: 0,
      };
    case "drawerBase":
      return {
        ...common,
        name: "Drawers 600",
        kind: "drawerBase",
        width: 600,
        height: 870,
        depth: 580,
        toeKickHeight: 100,
        toeKickSetback: 60,
        drawerSlideId: "blumTandem500",
        doorStyle: "drawerFront",
        drawerCount: 3,
        shelfCount: 0,
        roomY: 0,
      };
    case "sinkBase":
      return {
        ...common,
        name: "Sink Base 900",
        kind: "sinkBase",
        width: 900,
        height: 870,
        depth: 580,
        toeKickHeight: 100,
        toeKickSetback: 60,
        drawerSlideId: null,
        shelfCount: 0,
        roomY: 0,
      };
    case "cornerBase":
      return {
        ...common,
        name: "Blind Corner Base",
        kind: "cornerBase",
        width: 900,
        height: 870,
        depth: 580,
        toeKickHeight: 100,
        toeKickSetback: 60,
        drawerSlideId: null,
        shelfCount: 1,
        cornerDepth: 580,
        blindWidth: 300,
        roomY: 0,
      };
  }
}
