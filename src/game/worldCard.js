import { exhibitStops } from './exhibitStops.js'

export function selectVisibleStop(s) {
  if ((s.phase !== 'playing' && !s.exhibitFocus) || s.menuOpen) return null
  if (s.cardsDismissed && !s.currentStop) return null
  if (s.exhibitFocus) return exhibitStops.find(stop => stop.zone.key === s.exhibitFocus && stop.pageIndex === (s.exhibitPage[s.exhibitFocus] || 0))
  return exhibitStops.find(stop => stop.id === s.currentStop)
}

// HTML is projected onto a physical display in world space. The camera fits the
// display to the available viewport; its text is never fixed to the screen.
export function worldCardFrame(stop, viewportWidth, viewportHeight) {
  const width = Math.min(440, viewportWidth - 44)
  const height = Math.min(620, Math.max(250, viewportHeight - 150))
  const worldWidth = width / 80
  const worldHeight = height / 80
  const dx = stop.road[0] - stop.pos[0], dz = stop.road[1] - stop.pos[2]
  const length = Math.hypot(dx, dz)
  const normal = [dx / length, dz / length]
  const center = [stop.pos[0], 1.1 + worldHeight / 2, stop.pos[2]]
  const fov = 50 * Math.PI / 180
  const aspect = viewportWidth / viewportHeight
  const distance = Math.max(
    worldHeight / (2 * Math.tan(fov / 2)) * viewportHeight / (viewportHeight - 125),
    worldWidth / (2 * Math.tan(fov / 2) * aspect) * viewportWidth / (viewportWidth - 48)
  ) + .7
  return { width, height, worldWidth, worldHeight, center, normal, rotation: Math.atan2(normal[0], normal[1]), distance }
}
