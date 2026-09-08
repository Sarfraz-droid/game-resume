import { courseRoute } from './courseRoute.js'

export const BEST_LAP_KEY = 'career-circuit.best-lap.v1'
const gates = Array.from({ length: 12 }, (_, i) => courseRoute[Math.floor(i * courseRoute.length / 12)])
const start = courseRoute[0]

export function createLapTimer(best = null) {
  return { status: 'ready', elapsed: 0, lastLap: null, best, startedAt: null, finishedAt: null, nextGate: 1, previous: null, lastNow: null, resetVersion: null, laps: 0 }
}
export function formatLap(ms) {
  if (ms === null || !Number.isFinite(ms)) return '—:——.——'
  const total = Math.max(0, Math.floor(ms / 10))
  return `${Math.floor(total / 6000)}:${String(Math.floor(total / 100) % 60).padStart(2, '0')}.${String(total % 100).padStart(2, '0')}`
}
export function readBestLap(storage) {
  try {
    const record = JSON.parse(storage.getItem(BEST_LAP_KEY))
    return { best: Number.isFinite(record?.milliseconds) && record.milliseconds > 0 ? record.milliseconds : null, available: true }
  } catch { return { best: null, available: false } }
}
export function saveBestLap(storage, milliseconds) {
  try { storage.setItem(BEST_LAP_KEY, JSON.stringify({ milliseconds, savedAt: new Date().toISOString() })); return true } catch { return false }
}

// Ordered checkpoints prevent reversing across the finish or cutting through
// the infield from recording a lap. Resets, teleports and autopilot cancel it.
export function advanceLap(timer, sample) {
  const { x, z, now, wallTime, playing, automatic, paused, resetVersion = 0 } = sample
  const previous = timer.previous
  const dt = timer.lastNow === null ? 0 : Math.max(0, now - timer.lastNow)
  const reset = timer.resetVersion !== null && resetVersion !== timer.resetVersion
  timer.resetVersion = resetVersion
  timer.lastNow = now
  timer.previous = { x, z }
  if (!playing || automatic || reset || (previous && Math.hypot(x - previous.x, z - previous.z) > 8)) {
    timer.status = automatic ? 'tour' : 'ready'
    timer.elapsed = 0; timer.nextGate = 1; timer.startedAt = null
    return null
  }
  if (paused) return null
  if (timer.status === 'tour') timer.status = 'ready'
  if (timer.status === 'running') timer.elapsed += dt
  if (timer.status === 'running' && timer.nextGate < gates.length) {
    const gate = gates[timer.nextGate]
    if (Math.hypot(x - gate.x, z - gate.z) < 3) timer.nextGate++
  }
  const crossing = previous && previous.z >= start.z && z < start.z && Math.abs(x - start.x) < 2.3
  if (!crossing) return null
  if (timer.status !== 'running') {
    timer.status = 'running'; timer.elapsed = 0; timer.startedAt = wallTime; timer.nextGate = 1
    return null
  }
  if (timer.nextGate !== gates.length) return null
  const lap = timer.elapsed
  timer.lastLap = lap; timer.finishedAt = wallTime; timer.laps++
  const record = timer.best === null || lap < timer.best
  if (record) timer.best = lap
  timer.elapsed = 0; timer.startedAt = wallTime; timer.nextGate = 1
  return { milliseconds: lap, record }
}
