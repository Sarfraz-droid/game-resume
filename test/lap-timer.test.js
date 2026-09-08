import test from 'node:test'
import assert from 'node:assert/strict'
import { courseRoute } from '../src/game/courseRoute.js'
import { advanceLap, createLapTimer, formatLap, readBestLap, saveBestLap, BEST_LAP_KEY } from '../src/game/lapTimer.js'

function runLap(timer, options = {}) {
  const results = []
  for (let i = 0; i <= courseRoute.length + 1; i++) {
    const point = courseRoute[i % courseRoute.length]
    const lap = advanceLap(timer, { ...point, now: i * 50, wallTime: 1700000000000 + i * 50, playing: true, automatic: false, ...options })
    if (lap) results.push(lap)
  }
  return results
}

test('a full forward circuit records a lap and immediately starts the next one', () => {
  const timer = createLapTimer()
  const [lap] = runLap(timer)
  assert.ok(lap.milliseconds > 0)
  assert.equal(lap.record, true)
  assert.equal(timer.best, lap.milliseconds)
  assert.equal(timer.lastLap, lap.milliseconds)
  assert.equal(timer.laps, 1)
  assert.equal(timer.status, 'running')
  assert.ok(timer.finishedAt > 1700000000000)
})

test('crossing back and forth at the finish cannot produce a lap', () => {
  const timer = createLapTimer()
  for (let i = 0; i < 20; i++) assert.equal(advanceLap(timer, { x: .15, z: i % 2 ? 17 : 19, now: i * 1000, wallTime: i * 1000, playing: true }), null)
  assert.equal(timer.best, null)
})

test('autopilot and resets cannot set a best lap', () => {
  const automatic = createLapTimer()
  assert.deepEqual(runLap(automatic, { automatic: true }), [])
  assert.equal(automatic.best, null)
  const reset = createLapTimer()
  advanceLap(reset, { x: .15, z: 18, now: 0, wallTime: 0, playing: true, resetVersion: 0 })
  advanceLap(reset, { x: .15, z: 17, now: 100, wallTime: 100, playing: true, resetVersion: 0 })
  assert.equal(reset.status, 'running')
  advanceLap(reset, { x: .15, z: 18, now: 200, wallTime: 200, playing: true, resetVersion: 1 })
  assert.equal(reset.status, 'ready')
  assert.equal(reset.best, null)
})

test('reading and menus pause elapsed race time', () => {
  const timer = createLapTimer()
  const sample = { x: .15, z: 18, now: 0, wallTime: 0, playing: true }
  advanceLap(timer, sample)
  advanceLap(timer, { ...sample, z: 17, now: 100 })
  advanceLap(timer, { ...sample, z: 16, now: 1100 })
  assert.equal(timer.elapsed, 1000)
  advanceLap(timer, { ...sample, z: 16, now: 11100, paused: true })
  assert.equal(timer.elapsed, 1000)
})

test('best lap survives reload; unavailable or malformed storage is safe', () => {
  const data = new Map()
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }
  assert.equal(readBestLap(storage).best, null)
  assert.equal(saveBestLap(storage, 65432), true)
  assert.equal(readBestLap(storage).best, 65432)
  data.set(BEST_LAP_KEY, '{broken')
  assert.equal(readBestLap(storage).best, null)
  assert.equal(saveBestLap(null, 1000), false)
  assert.equal(formatLap(65432), '1:05.43')
})
