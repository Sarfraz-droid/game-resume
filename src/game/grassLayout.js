import { ISLAND_R } from './layout.js'

function seededRandom(initialSeed) {
  let seed = initialSeed
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function createPackedGrassPatches(isClear) {
  const random = seededRandom(918273)
  const result = []

  const layers = [
    { name: 'carpet', count: 110, fit: [7, 10], height: [0.82, 1.02], minRadius: 15, pad: 1.6 },
    { name: 'meadow', count: 70, fit: [9.5, 14], height: [1, 1.24], minRadius: 18, pad: 2.2 },
    { name: 'accent', count: 35, fit: [7.5, 11], height: [1.38, 1.72], minRadius: 25, pad: 2.6 },
  ]

  for (const layer of layers) {
    let placed = 0
    let guard = 0
    while (placed < layer.count && guard++ < 24000) {
      const angle = random() * Math.PI * 2
      const radius = layer.minRadius + random() * (ISLAND_R - layer.minRadius - 4)
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius * 0.9
      const rotation = random() * Math.PI * 2
      const rawFit = layer.fit[0] + random() * (layer.fit[1] - layer.fit[0])
      const fit = Math.round(rawFit * 2) / 2
      const heightScale = layer.height[0] + random() * (layer.height[1] - layer.height[0])
      const tone = Math.floor(random() * 4)
      const half = fit * 0.48
      const dx = Math.sin(rotation) * half
      const dz = Math.cos(rotation) * half
      if (
        !isClear(x, z, layer.pad) ||
        !isClear(x + dx, z + dz, 0.8) ||
        !isClear(x - dx, z - dz, 0.8)
      ) continue

      result.push({ x, z, rotation, fit, heightScale, layer: layer.name, tone })
      placed++
    }
  }

  return result
}
