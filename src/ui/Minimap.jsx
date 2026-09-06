import { useEffect, useRef } from 'react'
import {
  carState,
  zoneLayout,
  footpaths,
  LOOP_RX,
  LOOP_RZ,
  ISLAND_R,
} from '../game/layout.js'
import { useStore } from '../state/store.js'

const SIZE = 260
const SPAN = ISLAND_R * 2 + 16 // world units mapped across the minimap

export default function Minimap() {
  const ref = useRef()
  useEffect(() => {
    const ctx = ref.current.getContext('2d')
    let raf
    const k = SIZE / SPAN
    const p2 = (x, z) => [SIZE / 2 + x * k, SIZE / 2 + z * k]

    const draw = () => {
      ctx.clearRect(0, 0, SIZE, SIZE)
      // island
      ctx.fillStyle = '#cfe3b4'
      ctx.beginPath()
      ctx.ellipse(SIZE / 2, SIZE / 2, ISLAND_R * k, ISLAND_R * 0.9 * k, 0, 0, 7)
      ctx.fill()

      // footpaths
      ctx.strokeStyle = 'rgba(215,198,160,0.9)'
      ctx.lineWidth = 3
      for (const p of footpaths) {
        const [ax, ay] = p2(p.a[0], p.a[1])
        const [bx, by] = p2(p.b[0], p.b[1])
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(bx, by)
        ctx.stroke()
      }

      // loop road
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.ellipse(SIZE / 2, SIZE / 2, LOOP_RX * k, LOOP_RZ * k, 0, 0, 7)
      ctx.stroke()

      const { current, visited } = useStore.getState()
      for (const z of zoneLayout) {
        const [px, py] = p2(z.pos[0], z.pos[2])
        ctx.beginPath()
        ctx.arc(px, py, current === z.key ? 8 : 6, 0, 7)
        ctx.fillStyle = visited[z.key] ? '#5cbf85' : z.color
        ctx.fill()
        ctx.lineWidth = 2
        ctx.strokeStyle = '#fff'
        ctx.stroke()
      }

      const [cx, cy] = p2(carState.x, carState.z)
      const h = carState.heading
      const fx = Math.sin(h)
      const fz = Math.cos(h)
      ctx.save()
      ctx.translate(cx, cy)
      ctx.beginPath()
      ctx.moveTo(fx * 12, fz * 12)
      ctx.lineTo(-fx * 8 + fz * 7, -fz * 8 + fx * 7)
      ctx.lineTo(-fx * 8 - fz * 7, -fz * 8 - fx * 7)
      ctx.closePath()
      ctx.fillStyle = '#22252d'
      ctx.fill()
      ctx.restore()

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="minimap" aria-hidden="true">
      <canvas ref={ref} width={SIZE} height={SIZE} />
    </div>
  )
}
