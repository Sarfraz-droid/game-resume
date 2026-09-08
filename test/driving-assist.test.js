import test from 'node:test'
import assert from 'node:assert/strict'
import { createDrivingAssist, drivingControls } from '../src/game/drivingAssist.js'
import { createVehicle, advanceVehicle } from '../src/game/vehiclePhysics.js'
import { CAR_SPAWN } from '../src/game/layout.js'
import { loadTrack } from './helpers/loadTrack.js'

const trackPromise = loadTrack()
function pilot(driver, automatic = true, assisted = true) {
  return (s, input, dt, track) => drivingControls(s, input, dt, track, driver, automatic, assisted)
}

test('production autopilot completes three laps, including jumps, without recovery', async () => {
  const track = await trackPromise
  const s = createVehicle(CAR_SPAWN), driver = createDrivingAssist()
  let airborne = 0, maxStep = 0, oldX = s.x, oldZ = s.z
  for (let i = 0; i < 130 * 60 && driver.laps < 3; i++) {
    advanceVehicle(s, {}, 1 / 60, track, CAR_SPAWN, false, pilot(driver))
    if (!s.grounded) airborne++
    maxStep = Math.max(maxStep, Math.hypot(s.x - oldX, s.z - oldZ))
    oldX = s.x; oldZ = s.z
    assert.ok(s.y > 0 && s.y < 8)
  }
  assert.equal(driver.laps, 3)
  assert.ok(airborne > 100)
  assert.ok(maxStep < 0.5, 'normal laps must not teleport or use recovery')
})

test('autopilot is frame-rate independent and pauses with the vehicle', async () => {
  const track = await trackPromise
  const states = [30, 144].map(fps => {
    const s = createVehicle(CAR_SPAWN), driver = createDrivingAssist()
    for (let i = 0; i < 20 * fps; i++) advanceVehicle(s, {}, 1 / fps, track, CAR_SPAWN, false, pilot(driver))
    const before = { ...s }, index = driver.index
    advanceVehicle(s, {}, 1, track, CAR_SPAWN, true, pilot(driver))
    assert.equal(s.x, before.x); assert.equal(s.z, before.z); assert.equal(driver.index, index)
    return s
  })
  assert.ok(Math.hypot(states[0].x - states[1].x, states[0].z - states[1].z) < 1e-7)
})

test('autopilot rejoins from off course or facing backwards', async () => {
  const track = await trackPromise
  for (const spawn of [{ x: 35, z: 20, heading: 0 }, { ...CAR_SPAWN, heading: 0 }]) {
    const s = createVehicle(spawn), driver = createDrivingAssist()
    for (let i = 0; i < 8 * 60; i++) advanceVehicle(s, {}, 1 / 60, track, CAR_SPAWN, false, pilot(driver))
    assert.ok(s.speed > 3)
    assert.ok(s.y > 0)
    assert.equal(s.road, true)
  }
})

test('assist brakes excessive corner speed without reverse or adding throttle', async () => {
  const track = await trackPromise
  const s = createVehicle({ x: 0.15, z: -28, heading: Math.PI })
  s.speed = 19; s.vz = -19
  const driver = createDrivingAssist()
  const controls = drivingControls(s, { thr: 1, str: 0 }, 1 / 120, track, driver, false, true)
  assert.ok(controls.brake > 0)
  assert.equal(controls.thr, 0)
  const coasting = drivingControls(s, { thr: 0, str: 0 }, 1 / 120, track, driver, false, true)
  assert.equal(coasting.thr, 0)
  assert.equal(coasting.str, 0)
})

test('assist leaves drifting, reverse, and the jump run-up under driver control', async () => {
  const track = await trackPromise
  const s = createVehicle({ x: 15, z: 11.5, heading: -Math.PI / 2 })
  s.speed = 17; s.vx = -17
  const driver = createDrivingAssist()
  const input = { thr: 1, str: 0, drift: false }
  const assisted = drivingControls(s, input, 1 / 120, track, driver, false, true)
  assert.equal(assisted.thr, 1); assert.equal(assisted.brake, 0)
  const drift = { thr: 1, str: 1, drift: true }
  assert.deepEqual(drivingControls(s, drift, 1 / 120, track, driver, false, true), drift)
  assert.deepEqual(drivingControls(s, input, 1 / 120, track, driver, false, false), input)
  s.speed = -3
  const reverse = { thr: -1, str: 1 }
  assert.deepEqual(drivingControls(s, reverse, 1 / 120, track, driver, false, true), reverse)
})

test('autopilot waits for geometry instead of driving on a placeholder floor', () => {
  const controls = drivingControls(createVehicle(CAR_SPAWN), {}, 1 / 120, null, createDrivingAssist(), true, true)
  assert.equal(controls.brake, 1)
  assert.equal(controls.thr, undefined)
})
