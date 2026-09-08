import { CAR_SPAWN } from './layout.js'

// Centreline and target speeds (m/s) for the authored course. Speeds rise on
// the jump approach and fall before the next bend; geometry remains authoritative.
const points = []
function line(x, z, v = 7) { points.push({ x, z, v }) }
function arc(cx, cz, radius, start, end, speed = 5) {
  for (let i = 1; i <= 10; i++) {
    const angle = start + (end - start) * i / 10
    line(cx + Math.cos(angle) * radius, cz + Math.sin(angle) * radius, speed)
  }
}

line(0.15, -28)
line(0.15, -30.6, 5)
arc(4.7, -30.6, 4.55, Math.PI, 2 * Math.PI)
line(9.25, -25, 5)
arc(13.8, -25, 4.55, Math.PI, Math.PI / 2)
line(19.7, -20.45, 5)
arc(19.7, -15.6, 4.85, -Math.PI / 2, 0)
line(25, -10)
line(25, -6)
line(23.6, -2)
line(24.5, 3)
line(24.25, 6.95, 5)
arc(19.7, 6.95, 4.55, 0, Math.PI / 2)
line(15, 11.5, 13.5)
line(8, 11.5, 13.5)
line(-18, 11.5, 13.5)
line(-23.2, 11.5, 5)
arc(-23.2, 6.95, 4.55, Math.PI / 2, Math.PI * 1.5)
line(-13.5, 2.4, 5)
arc(-13.5, 6.95, 4.55, -Math.PI / 2, 0)
line(-8.95, 25.6, 5)
arc(-4.4, 25.6, 4.55, Math.PI, 0)
line(0.15, 18, 5)

const dense = [{ x: CAR_SPAWN.x, z: CAR_SPAWN.z, v: 7 }]
for (const point of points) {
  const previous = dense.at(-1)
  const count = Math.ceil(Math.hypot(point.x - previous.x, point.z - previous.z) / 0.4)
  for (let i = 1; i <= count; i++) dense.push({
    x: previous.x + (point.x - previous.x) * i / count,
    z: previous.z + (point.z - previous.z) * i / count,
    v: point.v,
  })
}
// The last point duplicates the first; omit it for continuous lap wrapping.
export const courseRoute = dense.slice(0, -1)
