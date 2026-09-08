import { useEffect, useRef } from 'react'
import { carState } from '../game/layout.js'
import { useStore } from '../state/store.js'

export default function DrivingStatus() {
  const speed = useRef()
  const mode = useRef()
  const focused = useStore(s => s.exhibitFocus)
  const panel = useStore(s => s.panel)
  const menu = useStore(s => s.menuOpen)
  useEffect(() => {
    const update = () => {
      if (speed.current) speed.current.textContent = Math.round(Math.abs(carState.speed) * 3.6)
      if (mode.current) mode.current.textContent = !carState.grounded ? 'AIR' : carState.drifting ? 'DRIFT' : carState.speed < -0.3 ? 'REVERSE' : (carState.drivingMode || 'DRIVE')
    }
    update()
    const timer = setInterval(update, 100)
    return () => clearInterval(timer)
  }, [])
  return (
    <div className="driving-status" hidden={!!panel || menu || !!focused} aria-label="Vehicle speed in kilometres per hour">
      <span ref={mode} className="driving-mode">DRIVE</span>
      <span><strong ref={speed}>0</strong> <small>km/h</small></span>
      <span className="driving-help">Space / Shift: drift · R: reset</span>
    </div>
  )
}
