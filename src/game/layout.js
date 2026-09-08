import { ZONES } from './zones.js'

// ---- world dimensions ---------------------------------------------------
// The course itself now comes from map/low_poly_race_track.glb. These values
// only define driving limits, the spawn point, and checkpoint placement.
export const ISLAND_R = 74
export const DRIVE_R = 68
export const FENCE_R = 70
export const LOOP_RX = 43
export const LOOP_RZ = 34
export const LOOP_R_AVG = (LOOP_RX + LOOP_RZ) / 2
export const ROAD_HALF = 4.6 // half width of the drivable loop path
export const PATH_HALF = 2.1 // half width of a footpath
export const PLAZA_R = 13 // open central lawn kept clear of props
export const CAR_R = 1.0

// ---- deterministic RNG ------------------------------------------------
function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rnd = mulberry32(20260906)
export const rand = rnd

// Resume pointers sit at the major bends and the start/finish area. Keeping
// them track-side lets the driver discover the story in race order.
const CHECKPOINTS = [
  [-4.4, 17, 0.15, 17], [15, -25, 9.25, -27], [17, -10, 25, -10],
  [-20, 18, -23.2, 11.5], [-20, 7, -23.2, 2.4], [-14, 23, -8.95, 23], [-4.4, 25, 0.15, 25],
]
export const zoneLayout = ZONES.map((z, i) => {
  const [x, zPos, roadX, roadZ] = CHECKPOINTS[i]
  const distance = Math.hypot(x - roadX, zPos - roadZ)
  const offset = Math.min(distance, 3.8) / distance
  return { ...z, number: i + 1, pos: [roadX + (x - roadX) * offset, 1, roadZ + (zPos - roadZ) * offset], road: [roadX, roadZ] }
})

// ---- footpaths: plaza edge → each zone ------------------------------
export const footpaths = zoneLayout.map((z) => {
  const len = Math.hypot(z.pos[0], z.pos[2])
  const ux = z.pos[0] / len
  const uz = z.pos[2] / len
  return {
    a: [ux * (PLAZA_R - 2), uz * (PLAZA_R - 2)],
    b: [z.pos[0], z.pos[2]],
    angle: Math.atan2(z.pos[0], z.pos[2]),
    length: len - (PLAZA_R - 2),
    mid: [(ux * (PLAZA_R - 2) + z.pos[0]) / 2, (uz * (PLAZA_R - 2) + z.pos[2]) / 2],
  }
})

export const ponds = []

// ---- placement helpers --------------------------------------------
function distToSeg(px, pz, ax, az, bx, bz) {
  const dx = bx - ax
  const dz = bz - az
  const len2 = dx * dx + dz * dz || 1
  let t = ((px - ax) * dx + (pz - az) * dz) / len2
  t = t < 0 ? 0 : t > 1 ? 1 : t
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz))
}

/** Within `pad` world-units of the loop-path centreline. */
export const onLoop = (x, z, pad = 0) => {
  const n = Math.hypot(x / LOOP_RX, z / LOOP_RZ)
  return Math.abs(n - 1) * LOOP_R_AVG < ROAD_HALF + pad
}
export const onFootpath = (x, z, pad = 0) =>
  footpaths.some((p) => distToSeg(x, z, p.a[0], p.a[1], p.b[0], p.b[1]) < PATH_HALF + pad)
export const nearZone = (x, z, pad) =>
  zoneLayout.some((zn) => Math.hypot(x - zn.pos[0], z - zn.pos[2]) < pad)
export const inPond = (x, z, pad = 1) =>
  ponds.some((p) => Math.hypot(x - p.x, z - p.z) < p.r + pad)

/** True where a decorative prop is allowed to stand. */
export const clear = (x, z, pad = 0) =>
  Math.hypot(x, z) > PLAZA_R + pad &&
  Math.hypot(x, z) < FENCE_R - 1.5 &&
  !onLoop(x, z, pad + 1.5) &&
  !onFootpath(x, z, pad + 0.5) &&
  !nearZone(x, z, Math.max(pad, 4)) &&
  !inPond(x, z)

function scatter(count, minR, maxR, pad, sMin = 1, sVar = 0.4) {
  const out = []
  let guard = 0
  while (out.length < count && guard++ < count * 200) {
    const a = rnd() * Math.PI * 2
    const r = minR + rnd() * (maxR - minR)
    const x = Math.cos(a) * r
    const z = Math.sin(a) * r * 0.88
    if (!clear(x, z, pad)) continue
    out.push({ x, z, s: sMin + rnd() * sVar, rot: rnd() * Math.PI * 2, tint: (rnd() * 4) | 0 })
  }
  return out
}

function clusterScatter(clusters, per, spread, minR, maxR, pad) {
  const out = []
  let guard = 0
  while (out.length < clusters * per && guard++ < clusters * 60) {
    const a = rnd() * Math.PI * 2
    const r = minR + rnd() * (maxR - minR)
    const cx = Math.cos(a) * r
    const cz = Math.sin(a) * r * 0.88
    if (nearZone(cx, cz, 5)) continue
    for (let k = 0; k < per; k++) {
      const x = cx + (rnd() - 0.5) * spread
      const z = cz + (rnd() - 0.5) * spread
      if (!clear(x, z, pad)) continue
      out.push({ x, z, c: (rnd() * 5) | 0, s: 0.85 + rnd() * 0.5, rot: rnd() * Math.PI * 2 })
    }
  }
  return out
}

// kind: 0 round canopy · 1 conifer · 2 birch — a ring of trees along the fence,
// fairly uniform in size so the scene doesn't read as noisy
export const trees = [
  ...scatter(30, LOOP_RX + 14, FENCE_R - 3, 7, 1.7, 0.5),
  ...scatter(14, FENCE_R - 6, FENCE_R - 2, 3, 1.9, 0.5),
].map((t, i) => ({ ...t, kind: [0, 0, 1, 0, 2, 1, 0][i % 7] }))

export const rocks = scatter(16, LOOP_RX + 5, FENCE_R - 4, 3, 1.4, 0.9)
export const bushes = scatter(46, PLAZA_R + 4, FENCE_R - 3, 2, 1.5, 0.7)
// dense flower borders hugging the fence line
export const flowers = clusterScatter(44, 30, 4.5, FENCE_R * 0.62, FENCE_R - 5, 0.5)
export const mushrooms = clusterScatter(10, 5, 2, FENCE_R * 0.6, FENCE_R - 8, 1)
export const pebbles = scatter(150, PLAZA_R, FENCE_R - 2, 0.3, 0.7, 0.9)

// ---- pond rim rocks -----------------------------------------------
export const pondRocks = ponds.flatMap((p, pi) =>
  Array.from({ length: 20 }, (_, i) => {
    const a = (i / 20) * Math.PI * 2 + (pi ? 0.4 : 0)
    const rr = p.r + 0.5 + rnd() * 0.7
    return {
      x: p.x + Math.cos(a) * rr,
      z: p.z + Math.sin(a) * rr * 0.9,
      s: 0.55 + rnd() * 0.5,
      rot: rnd() * Math.PI * 2,
    }
  })
)

// fallen logs & stumps dotted through the outer tree line
// (only rendered when the forest pack is present)
export const logs = scatter(10, LOOP_RX + 6, FENCE_R - 4, 3, 1, 0.6)

// ---- picket fence ring ------------------------------------------
export const fencePosts = Array.from({ length: 132 }, (_, i) => {
  const a = (i / 132) * Math.PI * 2
  return { x: Math.cos(a) * FENCE_R, z: Math.sin(a) * FENCE_R * 0.92, rot: -a }
})

// lamp posts along the outer kerb of the loop path (uniform)
export const lamps = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2
  return {
    x: Math.cos(a) * (LOOP_RX + ROAD_HALF + 1.6),
    z: Math.sin(a) * (LOOP_RZ + ROAD_HALF + 1.6),
    rot: -a,
  }
})

// one bench beside each footpath, turned to face the path (all identical size)
export const benches = footpaths.map((p) => {
  const ux = p.b[0] / Math.hypot(p.b[0], p.b[1])
  const uz = p.b[1] / Math.hypot(p.b[0], p.b[1])
  const along = PLAZA_R + 7
  const side = PATH_HALF + 2
  return {
    x: ux * along - uz * side,
    z: uz * along + ux * side,
    rot: -p.angle + Math.PI / 2,
  }
})

// grazing sheep on the lawn (only shown when a model is present)
export const sheep = [
  { x: PLAZA_R + 6, z: -3, rot: 1.2 },
  { x: -PLAZA_R - 8, z: 7, rot: -0.6 },
  { x: 3, z: -PLAZA_R - 7, rot: 2.4 },
]

// scenic props that only appear when their model file is present
export const treehouse = { x: FENCE_R * 0.7, z: -FENCE_R * 0.5, rot: -0.55 }

export const obstacles = zoneLayout.map((z) => ({ x: z.pos[0], z: z.pos[2], r: 1.7 }))

// Start on the imported circuit’s start/finish straight, facing north.
export const CAR_SPAWN = { x: 0.15, z: 18, heading: Math.PI, y: 1.1 }
export const carState = { ...CAR_SPAWN, speed: 0, steer: 0, drifting: false, slip: 0, grounded: true, nearDist: 999 }
