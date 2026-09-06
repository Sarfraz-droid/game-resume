import test from 'node:test'
import assert from 'node:assert/strict'
import { createPackedGrassPatches } from '../src/game/grassLayout.js'

test('grass layout provides dense, visually varied coverage', () => {
  const patches = createPackedGrassPatches(() => true)
  const layers = new Set(patches.map((patch) => patch.layer))
  const fits = patches.map((patch) => patch.fit)
  const heights = patches.map((patch) => patch.heightScale)
  const tones = new Set(patches.map((patch) => patch.tone))

  assert.ok(patches.length >= 160, `expected at least 160 GLB patches, received ${patches.length}`)
  assert.ok(layers.size >= 3, `expected at least 3 placement layers, received ${layers.size}`)
  assert.ok(Math.max(...fits) - Math.min(...fits) > 5, 'expected a broad range of patch footprints')
  assert.ok(Math.max(...heights) - Math.min(...heights) > 0.7, 'expected visibly varied grass heights')
  assert.equal(tones.size, 4, 'expected all four grass palettes to be represented')
})
