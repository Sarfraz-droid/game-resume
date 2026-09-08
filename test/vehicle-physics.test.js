import test from 'node:test'
import assert from 'node:assert/strict'
import { advanceVehicle, createVehicle, VEHICLE } from '../src/game/vehiclePhysics.js'
import { input, touch, readInput, clearInput, requestReset } from '../src/game/input.js'
import { CAR_SPAWN } from '../src/game/layout.js'
import { loadTrack } from './helpers/loadTrack.js'
const origin = { x: 0, z: 0, heading: 0 }
const flat = { sample: () => ({ y: 1.1, road: true }), colliders: [] }
function run(s, controls, seconds, fps = 60, track = flat) {
  for (let i = 0; i < Math.round(seconds * fps); i++) advanceVehicle(s, controls, 1 / fps, track)
  return s
}

test('keyboard and independent touch controls expose drift and reset, then clear', () => {
  clearInput()
  input.drift = true
  touch.up = true; touch.left = true
  assert.deepEqual(readInput(), { thr: 1, str: 1, drift: true, reset: false })
  touch.left = false
  assert.equal(readInput().thr, 1)
  input.reset = true
  assert.equal(readInput().reset, true)
  clearInput()
  requestReset()
  assert.equal(readInput().reset, true)
  assert.equal(readInput().reset, false)
  assert.deepEqual(readInput(), { thr: 0, str: 0, drift: false, reset: false })
})
test('accelerates smoothly, respects speed limits, coasts, brakes before reversing', () => {
  const s = createVehicle(origin)
  run(s, { thr: 1 }, 0.1)
  assert.ok(s.speed > 0 && s.speed < 2)
  run(s, { thr: 1 }, 15)
  assert.ok(s.speed > 14 && s.speed <= VEHICLE.maxForward)
  const speed = s.speed
  run(s, {}, 1)
  assert.ok(s.speed < speed && s.speed > 0)
  run(s, { thr: -1 }, 0.2)
  assert.ok(s.speed > 0)
  run(s, { thr: -1 }, 5)
  assert.ok(s.speed < -3 && s.speed >= -VEHICLE.maxReverse)
})
test('steering cannot spin a stationary car and reverses direction when backing up', () => {
  const s = run(createVehicle(origin), { str: 1 }, 1)
  assert.equal(s.heading, 0)
  run(s, { thr: 1, str: 1 }, 1)
  assert.ok(s.heading > 0 && s.x > 0)
  const reverse = run(createVehicle(origin), { thr: -1, str: 1 }, 1)
  assert.ok(reverse.heading < 0 && reverse.z < 0)
})
test('handbrake produces real lateral slip; release and countersteering recover grip', () => {
  const normal = run(createVehicle(origin), { thr: 1 }, 3)
  const drift = { ...normal }
  run(normal, { thr: 1, str: 0.7 }, 1)
  run(drift, { thr: 1, str: 0.7, drift: true }, 1)
  assert.ok(Math.abs(drift.slip) > Math.abs(normal.slip) * 2)
  assert.equal(normal.drifting, false)
  assert.equal(drift.drifting, true)
  const slip = Math.abs(drift.slip)
  run(drift, { thr: 1, str: -0.3 }, 0.3)
  run(drift, { thr: 1 }, 2)
  assert.ok(Math.abs(drift.slip) < slip * 0.1)
  assert.equal(drift.drifting, false)
})
test('30, 60 and 144 Hz renders produce the same simulation', () => {
  const states = [30, 60, 144].map(fps => {
    const s = run(createVehicle(origin), { thr: 1 }, 2, fps)
    return run(s, { thr: 1, str: 0.45, drift: true }, 2, fps)
  })
  for (const s of states.slice(1)) for (const key of ['x', 'z', 'heading', 'speed', 'slip']) assert.ok(Math.abs(s[key] - states[0][key]) < 1e-8, key)
})
test('pausing freezes momentum and reset clears a slide', () => {
  const s = run(createVehicle(origin), { thr: 1, str: 1, drift: true }, 2)
  const before = { ...s }
  advanceVehicle(s, {}, 1, flat, origin, true)
  assert.equal(s.x, before.x); assert.equal(s.z, before.z); assert.equal(s.vx, before.vx)
  advanceVehicle(s, { reset: true }, 0, flat, origin)
  assert.equal(s.x, 0); assert.equal(s.speed, 0); assert.equal(s.slip, 0)
})
test('collisions stop penetration while allowing travel alongside barriers', () => {
  const track = { ...flat, colliders: [{ minX: -10, maxX: 10, minZ: 5, maxZ: 5.1, minY: 0, maxY: 3 }] }
  const s = run(createVehicle(origin), { thr: 1 }, 4, 60, track)
  assert.ok(s.z <= 5 - VEHICLE.radius + 1e-8)
  assert.ok(Math.abs(s.speed) < 0.01)
})
test('off-road drag slows the car and missing ground triggers recovery', () => {
  const s = run(createVehicle(origin), { thr: 1 }, 5)
  const before = s.speed
  run(s, { thr: 1 }, 2, 60, { sample: () => ({ y: 1.1, road: false }), colliders: [] })
  assert.ok(s.speed < before * 0.7)
  for (let i = 0; i < 90; i++) advanceVehicle(s, {}, 1 / 60, { sample: () => null, colliders: [] }, origin)
  assert.ok(s.y > -8)
  assert.equal(s.x, origin.x)
})
test('the actual GLB start is on asphalt and the car drives over the raised bridge', async () => {
  const track = await loadTrack()
  assert.equal(track.sample(CAR_SPAWN.x, CAR_SPAWN.z, 1.5).road, true)
  const s = createVehicle(CAR_SPAWN)
  let maxY = s.y, airborne = false
  for (let i = 0; i < 360 && s.z > -26; i++) {
    advanceVehicle(s, { thr: 1 }, 1 / 60, track, CAR_SPAWN)
    maxY = Math.max(maxY, s.y)
    airborne ||= !s.grounded
  }
  assert.ok(maxY > 3, `bridge height ${maxY}`)
  assert.ok(s.z < -20 && s.z > -30)
  assert.ok(s.y > 1 && s.y < 1.3)
  assert.equal(s.grounded, true)
  assert.equal(airborne, true)
})

test('the jump clears from a standing start and from a short, slow approach', async () => {
  const track = await loadTrack()
  for (const [x, speed] of [[19, 0], [19, 3], [19, 5], [15, 3]]) {
    const s = createVehicle({ x, z: 11.5, y: 1.0594, heading: -Math.PI / 2 })
    s.vx = -speed
    let maxY = 0
    for (let i = 0; i < 360 && s.x > -20; i++) {
      advanceVehicle(s, { thr: 1 }, 1 / 60, track)
      maxY = Math.max(maxY, s.y)
    }
    assert.ok(s.x < -20 && s.x > -25, `jump from x=${x}, speed=${speed}`)
    assert.ok(maxY > 4 && maxY < 8)
    assert.ok(s.y > 1 && s.y < 1.3)
    assert.equal(s.grounded, true)
  }
})

test('a driver using only throttle and steering completes the imported circuit', async () => {
  const { courseRoute: route } = await import('./helpers/courseRoute.js')
  const track = await loadTrack()
  const s = createVehicle(CAR_SPAWN)
  let index = 0, offroadSteps = 0, maxHeight = 0
  // A pure-pursuit test driver: no position correction, teleports, or resets.
  for (let i = 0; i < 60 * 120 && index < route.length - 3; i++) {
    let nearest = index, distance = Infinity
    for (let k = index; k < Math.min(index + 25, route.length); k++) {
      const d = Math.hypot(route[k].x - s.x, route[k].z - s.z)
      if (d < distance) { distance = d; nearest = k }
    }
    index = nearest
    const target = route[Math.min(index + Math.round(6 + Math.abs(s.speed) * 0.4), route.length - 1)]
    const dx = target.x - s.x, dz = target.z - s.z
    const bearing = Math.atan2(dx, dz) - s.heading
    const angle = Math.atan2(2 * VEHICLE.wheelbase * Math.sin(bearing), Math.max(1, Math.hypot(dx, dz)))
    const str = Math.max(-1, Math.min(1, angle / (0.48 / (1 + Math.abs(s.speed) * 0.09))))
    const thr = s.speed < target.v ? 1 : s.speed > target.v + 0.5 ? -1 : 0
    advanceVehicle(s, { thr, str }, VEHICLE.step, track)
    maxHeight = Math.max(maxHeight, s.y)
    if (s.grounded && !s.road) offroadSteps++
    assert.ok(s.y > 0, 'car must remain on the course')
  }
  assert.ok(index >= route.length - 3, `stopped at waypoint ${index}/${route.length}`)
  assert.ok(Math.hypot(s.x - CAR_SPAWN.x, s.z - CAR_SPAWN.z) < 1.5)
  assert.ok(offroadSteps / 120 < 2, `driver must follow asphalt through the bends: ${offroadSteps / 120}s offroad`)
  assert.ok(maxHeight < 8, 'ramps must not launch the car uncontrollably')
})
