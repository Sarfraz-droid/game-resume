import { ZONES } from './zones.js'

// ---- world dimensions ---------------------------------------------------
// A walled garden: bright open lawn, one wide loop path, radial footpaths to
// every zone, planting beds hugging the picket fence, all greenery off the
// drivable surface so the car is never boxed in.
export const ISLAND_R = 62 // ground radius
export const DRIVE_R = 56 // how far from centre the car may roam
export const FENCE_R = 60 // picket fence ring
export const LOOP_RX = 40 // loop path — x semi-axis (centreline)
export const LOOP_RZ = 31 // loop path — z semi-axis (centreline)
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

// ---- zone world positions ------------------------------------------
// Structures sit just OUTSIDE the loop centreline so the path lane itself
// stays clear — you drive past a zone, you don't drive into it.
const ZONE_OFFSET = ROAD_HALF + 1.4
export const zoneLayout = ZONES.map((z, i) => {
  const a = -Math.PI / 2 + (i / ZONES.length) * Math.PI * 2
  const rx = LOOP_RX + ZONE_OFFSET
  const rz = LOOP_RZ + ZONE_OFFSET
  return { ...z, angle: a, pos: [Math.cos(a) * rx, 0, Math.sin(a) * rz] }
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

export const obstacles = [
  { x: 0, z: 0, r: 3.6 }, // central fountain
  ...zoneLayout.map((z) => ({ x: z.pos[0], z: z.pos[2], r: 1.7 })),
  ...trees.map((t) => ({ x: t.x, z: t.z, r: 0.55 * t.s })),
  ...rocks.map((t) => ({ x: t.x, z: t.z, r: 0.6 * t.s })),
]

// spawn on the south straight of the loop path, facing east along it
export const CAR_SPAWN = { x: 0, z: LOOP_RZ, heading: Math.PI / 2 }
export const carState = { ...CAR_SPAWN, speed: 0, steer: 0, nearDist: 999 }
