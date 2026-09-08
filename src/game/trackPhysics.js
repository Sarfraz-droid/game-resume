import { Box3, Vector3 } from 'three'

export const TRACK_SCALE = 1.8
export const TRACK_SURFACE_Y = 1.1
export const trackPhysics = { current: null }
const CELL = 4
const key = (x, z) => `${Math.floor(x / CELL)},${Math.floor(z / CELL)}`

// Build once from the same world transforms used by the rendered GLB. Only
// driveable meshes enter the surface grid; tree crowns never become roads.
export function buildTrackPhysics(scene) {
  scene.updateMatrixWorld(true)
  const grid = new Map()
  const colliders = []
  const a = new Vector3(), b = new Vector3(), c = new Vector3()
  scene.traverseVisible((object) => {
    if (!object.isMesh) return
    let owner = object
    while (owner.parent && !/^(Earth|road|crooked|bridge|springboard|parking|forest|stone|house|garages|tribune|barrier|fence|tower)/i.test(owner.name)) owner = owner.parent
    const name = owner.name
    if (/^(Earth|road|crooked|bridge|springboard|parking)/i.test(name)) {
      const position = object.geometry.attributes.position
      const indices = object.geometry.index
      const count = indices ? indices.count : position.count
      for (let i = 0; i < count; i += 3) {
        for (const [point, offset] of [[a, 0], [b, 1], [c, 2]]) point.fromBufferAttribute(position, indices ? indices.getX(i + offset) : i + offset).applyMatrix4(object.matrixWorld)
        const denominator = (b.z - c.z) * (a.x - c.x) + (c.x - b.x) * (a.z - c.z)
        if (Math.abs(denominator) < 0.00001) continue
        const normal = new Vector3().subVectors(b, a).cross(new Vector3().subVectors(c, a)).normalize()
        if (normal.y < 0.45) continue
        const triangle = { a: a.clone(), b: b.clone(), c: c.clone(), denominator, road: !/^Earth/i.test(name) }
        for (let x = Math.floor(Math.min(a.x, b.x, c.x) / CELL); x <= Math.floor(Math.max(a.x, b.x, c.x) / CELL); x++) {
          for (let z = Math.floor(Math.min(a.z, b.z, c.z) / CELL); z <= Math.floor(Math.max(a.z, b.z, c.z) / CELL); z++) {
            const k = `${x},${z}`
            if (!grid.has(k)) grid.set(k, [])
            grid.get(k).push(triangle)
          }
        }
      }
    } else if (/^(forest|stone|house|garages|tribune|barrier|fence|tower)/i.test(name)) {
      const bounds = new Box3().setFromObject(object)
      // The tree's collision footprint is its trunk, not its canopy.
      if (/^forest/i.test(name)) {
        const center = bounds.getCenter(new Vector3())
        bounds.min.x = center.x - 0.22; bounds.max.x = center.x + 0.22
        bounds.min.z = center.z - 0.22; bounds.max.z = center.z + 0.22
      }
      colliders.push({ minX: bounds.min.x, maxX: bounds.max.x, minZ: bounds.min.z, maxZ: bounds.max.z, minY: bounds.min.y, maxY: bounds.max.y })
    }
  })
  return {
    colliders,
    sample(x, z, ceiling = Infinity) {
      let result = null
      for (const t of grid.get(key(x, z)) || []) {
        const { a, b, c, denominator } = t
        const u = ((b.z - c.z) * (x - c.x) + (c.x - b.x) * (z - c.z)) / denominator
        const v = ((c.z - a.z) * (x - c.x) + (a.x - c.x) * (z - c.z)) / denominator
        if (u < -1e-5 || v < -1e-5 || u + v > 1.00001) continue
        const y = u * a.y + v * b.y + (1 - u - v) * c.y
        if (y > ceiling || (result && y < result.y - 0.001)) continue
        result = { y, road: t.road }
      }
      return result
    },
  }
}
