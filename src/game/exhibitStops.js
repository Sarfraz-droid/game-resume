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
  const pos = [x - dz * 3.8, 1, z + dx * 3.8]
  return { ...card, id: `${card.zone.key}-${card.pageIndex}`, road: [x, z], pos,
    heading: Math.atan2(dx, dz), distanceAlong: at,
    zone: { ...card.zone, road: [x, z], pos } }
})
export const tourMarkers = exhibitStops.filter(stop => stop.pageIndex === 0).map(stop => stop.zone)

export function nearestExhibitStop(x, z, heading) {
  let result = null, best = 5
  for (const stop of exhibitStops) {
    // Do not trigger a card on a neighboring lane travelling the other way.
    if (heading !== undefined && Math.cos(heading - stop.heading) < .25) continue
    const distance = Math.hypot(x - stop.road[0], z - stop.road[1])
    if (distance < best) { best = distance; result = stop }
  }
  return result
}
