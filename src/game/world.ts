export type Aabb = { minX: number; maxX: number; minZ: number; maxZ: number; minY?: number; maxY?: number }

export const ISLAND_RADIUS = 48

export const SPAWNS = [
  { x: 0, z: 2 },
  { x: 2.4, z: 0.4 },
  { x: -2.2, z: 0.8 },
  { x: 0.6, z: -2 },
]

export const AREAS = {
  clearing: { x: 0, z: 0, label: 'Forest Clearing' },
  facility: { x: 22, z: -10, label: 'Research Facility' },
  bunker: { x: -18, z: 18, label: 'Maintenance Bunker' },
  rocks: { x: 10, z: 24, label: 'Rocky Path' },
  extract: { x: 26, z: 22, label: 'Evacuation Zone' },
}

export const GENERATOR = { x: -18, z: 13.1 }
export const CRAFTING = { x: -15.4, z: 13.2 }
export const BEACON = { x: 26, z: 22 }
export const EXTRACT = { x: 26, z: 22 }

export const BUILDINGS: Aabb[] = [
  { minX: 18.2, maxX: 27.4, minZ: -14.6, maxZ: -6.2, maxY: 5.2 },
  { minX: 20.4, maxX: 24.8, minZ: -16.8, maxZ: -14.2, maxY: 3.4 },
  { minX: -22.5, maxX: -13.4, minZ: 14.6, maxZ: 22.8, maxY: 3.6 },
  { minX: 7.2, maxX: 13.6, minZ: 21.4, maxZ: 27.2, maxY: 2.8 },
]

export const ROCKS: { x: number; z: number; r: number }[] = [
  { x: 8, z: 22, r: 1.6 },
  { x: 12.4, z: 26.4, r: 1.9 },
  { x: 14.8, z: 21.2, r: 1.4 },
  { x: -6, z: 10, r: 1.3 },
  { x: 16, z: 4, r: 1.5 },
  { x: -10, z: -8, r: 1.7 },
  { x: 4, z: -16, r: 1.2 },
]

export const TREES: { x: number; z: number }[] = [
  [-14, -12], [-8, -18], [6, -20], [14, -18], [18, -4],
  [8, 8], [-22, 4], [-24, 12], [-8, 26], [0, 20],
  [20, 10], [30, 8], [32, 18], [-4, 8], [10, -8],
  [-16, -4], [24, 30], [-28, 8], [4, 14], [-12, 14],
].map(([x, z]) => ({ x, z }))

export const PICKUP_SPAWNS: { kind: 'metal' | 'batteries' | 'meds' | 'repair'; x: number; z: number }[] = [
  { kind: 'metal', x: -4, z: 4 },
  { kind: 'metal', x: 6, z: -3 },
  { kind: 'metal', x: 16, z: -8 },
  { kind: 'repair', x: 24.6, z: -12.4 },
  { kind: 'repair', x: 21.2, z: -8.6 },
  { kind: 'batteries', x: 23.4, z: -11 },
  { kind: 'meds', x: 3.2, z: 6.4 },
  { kind: 'meds', x: -12, z: 16 },
  { kind: 'repair', x: -20, z: 16.5 },
  { kind: 'metal', x: 12, z: 22 },
]

export const PATROLS = [
  [
    { x: 10, z: -6 },
    { x: 18, z: -4 },
    { x: 16, z: 8 },
    { x: 6, z: 10 },
  ],
  [
    { x: -8, z: 12 },
    { x: -4, z: 22 },
    { x: 8, z: 18 },
    { x: 2, z: 8 },
  ],
]

export function circleHitsAabb(x: number, z: number, r: number, b: Aabb): boolean {
  const cx = Math.max(b.minX, Math.min(x, b.maxX))
  const cz = Math.max(b.minZ, Math.min(z, b.maxZ))
  const dx = x - cx
  const dz = z - cz
  return dx * dx + dz * dz < r * r
}

export function losBlocked(ax: number, az: number, bx: number, bz: number): boolean {
  const steps = 10
  for (let i = 1; i < steps; i++) {
    const t = i / steps
    const x = ax + (bx - ax) * t
    const z = az + (bz - az) * t
    for (const b of BUILDINGS) {
      if (x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ) return true
    }
  }
  return false
}

export function resolveCollision(x: number, z: number, r: number): { x: number; z: number } {
  const dist = Math.hypot(x, z)
  if (dist > ISLAND_RADIUS - r) {
    const s = (ISLAND_RADIUS - r) / Math.max(0.001, dist)
    x *= s
    z *= s
  }
  for (const b of BUILDINGS) {
    if (!circleHitsAabb(x, z, r, b)) continue
    const cx = (b.minX + b.maxX) / 2
    const cz = (b.minZ + b.maxZ) / 2
    const dx = x - cx
    const dz = z - cz
    const push = Math.hypot(dx, dz) || 0.001
    x += (dx / push) * 0.35
    z += (dz / push) * 0.35
  }
  for (const rock of ROCKS) {
    const dx = x - rock.x
    const dz = z - rock.z
    const d = Math.hypot(dx, dz)
    const min = r + rock.r
    if (d < min && d > 0.001) {
      x = rock.x + (dx / d) * min
      z = rock.z + (dz / d) * min
    }
  }
  return { x, z }
}

export function dist2(ax: number, az: number, bx: number, bz: number): number {
  const dx = ax - bx
  const dz = az - bz
  return dx * dx + dz * dz
}
