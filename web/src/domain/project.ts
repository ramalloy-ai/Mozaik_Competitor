import type { CabinetSpec, Room } from "./types";
import { makeDefaultCabinet } from "./cabinets";

export interface Project {
  name: string;
  customer: string;
  rooms: Room[];
  pricing: {
    laborRatePerSquareMeter: number;
    hardwareMarkup: number;
    overallMarkup: number;
    taxRate: number;
  };
}

let counter = 0;
export function genId(prefix = "cab"): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}

export function makeDefaultProject(): Project {
  const cab1: CabinetSpec = {
    ...makeDefaultCabinet("base", genId()),
    roomX: 0,
    roomZ: 0,
  };
  const cab2: CabinetSpec = {
    ...makeDefaultCabinet("base", genId()),
    name: "Base 900",
    width: 900,
    roomX: 600,
    roomZ: 0,
  };
  const cab3: CabinetSpec = {
    ...makeDefaultCabinet("wall", genId()),
    roomX: 0,
    roomZ: 0,
  };
  return {
    name: "Untitled Kitchen",
    customer: "",
    rooms: [
      {
        id: "room-1",
        name: "Kitchen",
        widthX: 4000,
        depthZ: 3000,
        walls: [],
        wallHeight: 2400,
        cabinets: [cab1, cab2, cab3],
      },
    ],
    pricing: {
      laborRatePerSquareMeter: 90,
      hardwareMarkup: 0.35,
      overallMarkup: 0.2,
      taxRate: 0.08,
    },
  };
}

export function allCabinets(p: Project): CabinetSpec[] {
  return p.rooms.flatMap((r) => r.cabinets);
}
