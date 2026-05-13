import type { Material } from "./types";

export const MATERIALS: Record<string, Material> = {
  ply18: {
    id: "ply18",
    name: '3/4" Maple Plywood',
    thickness: 18,
    color: "#d9b382",
    hasGrain: true,
  },
  ply6: {
    id: "ply6",
    name: '1/4" Maple Plywood',
    thickness: 6,
    color: "#caa472",
    hasGrain: true,
  },
  mdf18: {
    id: "mdf18",
    name: '3/4" MDF (paint grade)',
    thickness: 18,
    color: "#bcb097",
    hasGrain: false,
  },
};

export function getMaterial(id: string): Material {
  const m = MATERIALS[id];
  if (!m) throw new Error(`Unknown material: ${id}`);
  return m;
}
