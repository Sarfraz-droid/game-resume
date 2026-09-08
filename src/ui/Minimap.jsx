import { useEffect, useRef } from 'react'
import { carState } from '../game/layout.js'
import { tourMarkers as zoneLayout } from '../game/exhibitStops.js'
import { courseRoute } from '../game/courseRoute.js'
import { useStore } from '../state/store.js'

const SIZE = 260, SPAN = 88
export default function Minimap() {
  const ref = useRef()
  useEffect(() => {
    const ctx = ref.current.getContext('2d')
    let raf
    const k = SIZE / SPAN
    const p2 = (x, z) => [SIZE / 2 + x * k, SIZE / 2 + z * k]
    const draw = () => {
      ctx.fillStyle = '#382922'; ctx.fillRect(0, 0, SIZE, SIZE)
      ctx.strokeStyle = '#d0b99d'; ctx.lineWidth = 4.6 * k
      ctx.lineJoin = 'round'; ctx.beginPath()
      courseRoute.forEach((p, i) => { const [x, z] = p2(p.x, p.z); if (!i) ctx.moveTo(x, z); else ctx.lineTo(x, z) })
      ctx.closePath(); ctx.stroke()
      const { current, visited, exhibitFocus } = useStore.getState()
      for (const zone of zoneLayout) {
        const [x, y] = p2(zone.pos[0], zone.pos[2]), [rx, ry] = p2(...zone.road)
        ctx.strokeStyle = zone.color; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(x, y); ctx.stroke()
        ctx.fillStyle = zone.color; ctx.beginPath(); ctx.arc(x, y, current === zone.key || exhibitFocus === zone.key ? 10 : 8, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#13292f'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(visited[zone.key] ? '✓' : String(zone.number), x, y)
      }
      const [x, y] = p2(carState.x, carState.z)
      ctx.save(); ctx.translate(x, y); ctx.rotate(-carState.heading)
      ctx.beginPath(); ctx.moveTo(0, 9); ctx.lineTo(6, -6); ctx.lineTo(-6, -6); ctx.closePath()
      ctx.fillStyle = '#fff4df'; ctx.fill(); ctx.strokeStyle = '#13292f'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore()
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])
  return <div className="minimap" aria-hidden="true"><canvas ref={ref} width={SIZE} height={SIZE} /></div>
}
