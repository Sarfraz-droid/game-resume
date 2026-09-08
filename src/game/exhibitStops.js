import { courseRoute } from './courseRoute.js'
import { zoneLayout } from './layout.js'
import { TOUR_CARDS } from '../data/tourCards.js'

// Space actual content cards evenly by road distance, not by bullet count.
// Most chapters have one card; only experience and projects need a second stop.
const route = courseRoute
const distances = [0]
for (let i = 1; i <= route.length; i++) {
  const a = route[i - 1], b = route[i % route.length]
  distances.push(distances.at(-1) + Math.hypot(b.x - a.x, b.z - a.z))
}
const total = distances.at(-1)
// The imported course has rocks between the two western lanes. Use the outer
// verges there; Contact belongs on the clear infield, away from the hairpin sign.
const OUTER_VERGE = new Set(['projects-1', 'education-0', 'about-0', 'contact-0'])
const cards = zoneLayout.flatMap(zone => TOUR_CARDS[zone.key].map((page, pageIndex, pages) => ({ zone, page, pageIndex, count: pages.length })))
export const exhibitStops = cards.map((card, n) => {
  const at = total * n / cards.length
  let i = 0
  while (i < route.length - 1 && distances[i + 1] <= at) i++
  const a = route[i], b = route[(i + 1) % route.length]
  const length = distances[i + 1] - distances[i]
  const t = (at - distances[i]) / length
  const x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t
  const dx = (b.x - a.x) / length, dz = (b.z - a.z) / length
  const id = `${card.zone.key}-${card.pageIndex}`
  const side = OUTER_VERGE.has(id) ? -1 : 1
  const along = id === 'experience-1' ? -2.5 : 0
  const pos = [x - dz * 3.8 * side + dx * along, 1, z + dx * 3.8 * side + dz * along]
  return { ...card, id: `${card.zone.key}-${card.pageIndex}`, road: [x, z], pos,
    heading: Math.atan2(dx, dz), distanceAlong: at,
    zone: { ...card.zone, road: [x, z], pos } }
})
export const tourMarkers = exhibitStops.filter(stop => stop.pageIndex === 0).map(stop => stop.zone)

export function nearestExhibitStop(x, z, _heading, currentId) {
  // A wider exit radius prevents cards flickering at the edge of a stop.
  const current = exhibitStops.find(stop => stop.id === currentId)
  if (current && (Math.hypot(x - current.road[0], z - current.road[1]) < 6.5 || Math.hypot(x - current.pos[0], z - current.pos[2]) < 4)) return current
  let result = null, best = 5
  for (const stop of exhibitStops) {
    const roadDistance = Math.hypot(x - stop.road[0], z - stop.road[1])
    const signDistance = Math.hypot(x - stop.pos[0], z - stop.pos[2])
    // Proximity, rather than travel direction or visit history, opens cards.
    const distance = signDistance < 3 ? Math.min(signDistance, roadDistance) : roadDistance
    if (distance < best) { best = distance; result = stop }
  }
  return result
}
