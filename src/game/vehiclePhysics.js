// Arcade bicycle dynamics in world units (metres, seconds, radians). Velocity
// stays in world space so turning the body does not instantly turn momentum.
export const VEHICLE = { maxForward: 28, maxReverse: 6, wheelbase: 1.04, wheelRadius: 0.22, radius: 0.62, step: 1 / 120 }
const clamp = (n, a, b) => Math.max(a, Math.min(b, n))
const damp = (a, b, rate, dt) => b + (a - b) * Math.exp(-rate * dt)
const towardZero = (n, amount) => Math.sign(n) * Math.max(0, Math.abs(n) - amount)

export function createVehicle(spawn) {
  return { x: spawn.x, z: spawn.z, y: spawn.y ?? 1.1, heading: spawn.heading, vx: 0, vz: 0, vy: 0, speed: 0, steer: 0, yawRate: 0, slip: 0, drift: 0, drifting: false, grounded: true, road: true, wheel: 0, pitch: 0, roll: 0, accumulator: 0, resetHeld: false }
}

export function resetVehicle(state, spawn) {
  Object.assign(state, createVehicle(spawn))
}

function collide(s, bounds) {
  const r = VEHICLE.radius
  if (s.y + 0.7 < bounds.minY || s.y > bounds.maxY) return
  const px = clamp(s.x, bounds.minX, bounds.maxX), pz = clamp(s.z, bounds.minZ, bounds.maxZ)
  let dx = s.x - px, dz = s.z - pz, distance = Math.hypot(dx, dz)
  if (distance >= r) return
  if (distance < 1e-8) {
    const faces = [[s.x - bounds.minX, -1, 0], [bounds.maxX - s.x, 1, 0], [s.z - bounds.minZ, 0, -1], [bounds.maxZ - s.z, 0, 1]].sort((a, b) => a[0] - b[0])
    const [depth, nx, nz] = faces[0]
    dx = nx; dz = nz; distance = -depth
  } else { dx /= distance; dz /= distance }
  s.x += dx * (r - distance); s.z += dz * (r - distance)
  const into = s.vx * dx + s.vz * dz
  if (into < 0) { s.vx -= into * dx; s.vz -= into * dz; s.yawRate *= 0.7 }
}

function step(s, input, dt, track) {
  const thr = clamp(input.thr || 0, -1, 1), steering = clamp(input.str || 0, -1, 1)
  const fx = Math.sin(s.heading), fz = Math.cos(s.heading)
  const rx = fz, rz = -fx
  let forward = s.vx * fx + s.vz * fz
  let lateral = s.vx * rx + s.vz * rz
  const speed = Math.hypot(forward, lateral)
  s.steer = damp(s.steer, steering, 14, dt)
  const handbrake = !!input.drift
  s.drift = damp(s.drift, handbrake && forward > 3 && s.grounded ? 1 : 0, handbrake ? 7 : 4, dt)
  if (s.grounded) {
    // S first brakes forward motion, then engages reverse near standstill.
    if (thr && forward * thr < -0.25) forward = towardZero(forward, 18 * dt)
    else if (thr) {
      const limit = thr > 0 ? VEHICLE.maxForward : VEHICLE.maxReverse
      forward += thr * 19 * Math.max(0, 1 - Math.max(0, forward * thr) / limit) * dt
    }
    forward = towardZero(forward, clamp(input.brake || 0, 0, 1) * 18 * dt)
    forward = towardZero(forward, (0.45 + speed * speed * 0.008 + (s.road ? 0 : speed * 0.65) + (handbrake ? 2.8 : 0)) * dt)
    // Released handbrake smoothly restores traction; countersteering reduces
    // yaw while existing lateral momentum carries the car through the slide.
    lateral *= Math.exp(-(s.road ? (input.assist ? 26 : 18) * (1 - s.drift) + 3.2 * s.drift : 5 - s.drift * 3) * dt)
    const angle = s.steer * (0.48 / (1 + Math.abs(forward) * 0.09))
    const desiredYaw = clamp(forward / VEHICLE.wheelbase * Math.tan(angle) * (1 + s.drift * 0.2), -1.9, 1.9)
    s.yawRate = damp(s.yawRate, desiredYaw, 12 - s.drift * 8, dt)
  } else s.yawRate = damp(s.yawRate, 0, 0.5, dt)
  s.vx = fx * forward + rx * lateral
  s.vz = fz * forward + rz * lateral
  s.heading += s.yawRate * dt
  s.heading = Math.atan2(Math.sin(s.heading), Math.cos(s.heading))
  s.x += s.vx * dt; s.z += s.vz * dt

  const oldY = s.y
  s.vy -= 16 * dt
  s.y += s.vy * dt
  const ground = track ? track.sample(s.x, s.z, Math.max(oldY, s.y) + 0.35) : { y: 1.1, road: true }
  s.grounded = !!ground && s.y <= ground.y + 0.025
  if (s.grounded) {
    s.y = ground.y
    // Preserve uphill velocity at ramp exits, allowing a short ballistic jump.
    s.vy = clamp((s.y - oldY) / dt, 0, Math.min(10.2, Math.hypot(s.vx, s.vz) * 0.85))
    s.road = ground.road
  }
  for (const bounds of track?.colliders || []) collide(s, bounds)
  if (!track) {
    for (const axis of ['x', 'z']) {
      if (Math.abs(s[axis]) > 74) { s[axis] = clamp(s[axis], -74, 74); s[axis === 'x' ? 'vx' : 'vz'] = 0 }
    }
  }
  const newFx = Math.sin(s.heading), newFz = Math.cos(s.heading)
  s.speed = s.vx * newFx + s.vz * newFz
  s.slip = Math.atan2(s.vx * newFz - s.vz * newFx, Math.max(1, Math.abs(s.speed)))
  s.drifting = s.grounded && Math.hypot(s.vx, s.vz) > 3 && Math.abs(s.slip) > 0.18
  s.wheel += s.speed * dt / VEHICLE.wheelRadius
  if (track && s.grounded) {
    const front = track.sample(s.x + newFx * 0.5, s.z + newFz * 0.5, s.y + 0.5)
    const rear = track.sample(s.x - newFx * 0.5, s.z - newFz * 0.5, s.y + 0.5)
    const left = track.sample(s.x - newFz * 0.46, s.z + newFx * 0.46, s.y + 0.5)
    const right = track.sample(s.x + newFz * 0.46, s.z - newFx * 0.46, s.y + 0.5)
    s.pitch = damp(s.pitch, front && rear ? -Math.atan2(front.y - rear.y, 1) : 0, 12, dt)
    s.roll = damp(s.roll, left && right ? Math.atan2(right.y - left.y, 0.92) : 0, 12, dt)
  }
}

export function advanceVehicle(s, input, elapsed, track = null, spawn = null, paused = false, driver = null) {
  if (input.reset && !s.resetHeld && spawn) resetVehicle(s, spawn)
  s.resetHeld = !!input.reset
  if (paused) { s.accumulator = 0; s.drifting = false; return s }
  s.accumulator += clamp(Number.isFinite(elapsed) ? elapsed : 0, 0, 0.1)
  while (s.accumulator + 1e-9 >= VEHICLE.step) {
    const controls = driver ? driver(s, input, VEHICLE.step, track) : input
    step(s, controls, VEHICLE.step, track)
    s.accumulator -= VEHICLE.step
    if (s.y < -8 && spawn) { resetVehicle(s, spawn); break }
  }
  return s
}
