import { courseRoute } from './courseRoute.js'
import { VEHICLE, resetVehicle } from './vehiclePhysics.js'

const clamp = (n, a, b) => Math.max(a, Math.min(b, n))
const wrap = n => (n % courseRoute.length + courseRoute.length) % courseRoute.length
const angleDifference = n => Math.atan2(Math.sin(n), Math.cos(n))
const pointAt = i => courseRoute[wrap(i)]
const headingAt = i => {
  const a = pointAt(i), b = pointAt(i + 3)
  return Math.atan2(b.x - a.x, b.z - a.z)
}

export function createDrivingAssist() {
  return { index: null, automatic: false, stuck: 0, laps: 0, status: 'Manual' }
}

function nearest(s, driver, global = false) {
  let best = driver.index ?? 0, score = Infinity
  const start = global ? 0 : driver.index - 4
  const end = global ? courseRoute.length : driver.index + 25
  for (let i = start; i < end; i++) {
    const p = pointAt(i)
    const distance = Math.hypot(p.x - s.x, p.z - s.z)
    // Heading disambiguates the bridge crossing and nearby parallel lanes.
    const cost = distance + (global ? Math.abs(angleDifference(headingAt(i) - s.heading)) * 1.3 : 0)
    if (cost < score) { score = cost; best = i }
  }
  return best
}

function rejoin(s, driver, track) {
  let i = wrap(driver.index)
  let p = pointAt(i)
  // Never recover into the unsupported middle of the jump.
  if (Math.abs(p.z - 11.5) < 1 && p.x > -19 && p.x < 19) {
    i = courseRoute.findIndex(p => p.x < 19 && p.x > 18 && Math.abs(p.z - 11.5) < 0.1)
    p = pointAt(i)
  }
  resetVehicle(s, { x: p.x, z: p.z, y: track.sample(p.x, p.z)?.y ?? 1.1, heading: headingAt(i) })
  driver.index = i
  driver.stuck = 0
  driver.status = 'Rejoining course'
}

/** Runs inside the physics clock, so the pilot behaves identically at any FPS. */
export function drivingControls(s, input, dt, track, driver, automatic, assisted) {
  if (!track) { driver.status = automatic ? 'Waiting for course' : 'Manual'; return automatic ? { brake: 1 } : input }
  const starting = automatic && !driver.automatic
  driver.index = nearest(s, driver, starting || driver.index === null || !!input.reset || !automatic)
  driver.automatic = automatic
  if (automatic && driver.index >= courseRoute.length) { driver.laps++; driver.index = wrap(driver.index) }
  const p = pointAt(driver.index)
  const distance = Math.hypot(p.x - s.x, p.z - s.z)
  const aligned = Math.abs(angleDifference(headingAt(driver.index) - s.heading)) < 0.8
  if (automatic) {
    driver.stuck = Math.abs(s.speed) < 0.6 && s.grounded ? driver.stuck + dt : 0
    if ((starting && (distance > 3 || !aligned) && s.grounded) || distance > 8 || driver.stuck > 3) rejoin(s, driver, track)
  }
  const lookahead = Math.round(6 + Math.abs(s.speed) * 0.4)
  const target = pointAt(driver.index + lookahead)
  const dx = target.x - s.x, dz = target.z - s.z
  const bearing = Math.atan2(dx, dz) - s.heading
  const wheelAngle = Math.atan2(2 * VEHICLE.wheelbase * Math.sin(bearing), Math.max(1, Math.hypot(dx, dz)))
  const steer = clamp(wheelAngle / (0.48 / (1 + Math.abs(s.speed) * 0.09)), -1, 1)
  if (automatic) {
    driver.status = s.grounded ? 'Autopilot' : 'Autopilot · airborne'
    const cruiseSpeed = Math.min(target.v * 1.3, 15.5)
    return { thr: s.speed < cruiseSpeed ? 1 : s.speed > cruiseSpeed + 0.5 ? -1 : 0, str: steer, drift: false }
  }
  driver.status = assisted ? 'Assist on' : 'Manual'
  if (!assisted || input.drift || s.drift > 0.1 || !s.grounded || s.speed < 0 || distance > 3 || !aligned) return input
  // Assist never adds throttle or reverses the car. A held drift bypasses it.
  const accelerating = input.thr > 0
  const jumpApproach = Math.abs(s.z - 11.5) < 2.5 && s.x > -19 && s.x < 21 && s.heading < -0.8 && s.heading > -2.3
  const limit = jumpApproach ? VEHICLE.maxForward : Math.max(8, target.v + 2)
  const braking = accelerating ? clamp((s.speed - limit) / 4, 0, 1) : 0
  const correction = accelerating && s.speed > 1 ? clamp(steer - (input.str || 0), -0.3, 0.3) * (input.str ? 0.35 : 1) : 0
  if (braking) driver.status = 'Corner braking'
  return { ...input, str: clamp((input.str || 0) + correction, -1, 1), thr: braking ? 0 : input.thr, brake: braking, assist: true }
}
