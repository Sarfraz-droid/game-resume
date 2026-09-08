import test from 'node:test'
import assert from 'node:assert/strict'
import { CONNECT_PAD as P, isConnectPadPressed } from '../src/game/connectPad.js'
import { advanceVehicle, createVehicle } from '../src/game/vehiclePhysics.js'
import { loadTrack } from './helpers/loadTrack.js'

test('connect button requires the car to be grounded over the physical pad', () => {
  const car = { x: P.x, z: P.z, y: P.y, grounded: true }
  assert.equal(isConnectPadPressed(car), true)
  assert.equal(isConnectPadPressed({ ...car, x: P.x + 2 }), false)
  assert.equal(isConnectPadPressed({ ...car, grounded: false }), false)
  assert.equal(isConnectPadPressed({ ...car, y: P.y + 3 }), false)
})

test('connect pad has ground and an unobstructed entry from outside the bend', async () => {
  const track = await loadTrack()
  for (let x = 2.2; x <= 6; x += .2) {
    const surface = track.sample(x, P.z, 3)
    assert.ok(surface && Math.abs(surface.y - P.y) < .35)
    assert.ok(!track.colliders.some(c => x + .62 > c.minX && x - .62 < c.maxX && P.z + .62 > c.minZ && P.z - .62 < c.maxZ))
  }
})

test('the car can cross the kerb and physically activate the connect pad', async () => {
  const track = await loadTrack()
  const spawn = { x: 2.2, z: P.z, y: track.sample(2.2, P.z, 3).y, heading: Math.PI / 2 }
  const car = createVehicle(spawn)
  let activated = false
  for (let i = 0; i < 240; i++) {
    advanceVehicle(car, { thr: 1, str: 0 }, 1 / 120, track, spawn)
    activated ||= isConnectPadPressed(car)
  }
  assert.equal(activated, true)
})
