import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowsOut } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { touch, clearInput, requestReset } from '../game/input.js'
import { useStore } from '../state/store.js'

const ICONS = { up: ArrowUp, down: ArrowDown, left: ArrowLeft, right: ArrowRight }

export default function TouchControls() {
  const focused = useStore(s => s.exhibitFocus)
  const current = useStore((s) => s.current)
  const menuOpen = useStore((s) => s.menuOpen)
  const panel = useStore((s) => s.panel)
  const focusExhibit = useStore((s) => s.focusExhibit)
  const [on, setOn] = useState(false)

  useEffect(() => {
    setOn(window.matchMedia?.('(pointer:coarse)').matches || 'ontouchstart' in window)
    return clearInput
  }, [])

  if (!on || panel || menuOpen || focused) return null
  const press = (dir, v) => (e) => {
    e.preventDefault()
    if (v) useStore.getState().setAutopilot(false)
    if (v && dir === 'reset') requestReset()
    if (v) e.currentTarget.setPointerCapture(e.pointerId)
    touch[dir] = v
  }

  return (
    <div className="touch">
      <div className="dpad">
        {['up', 'down', 'left', 'right'].map((d) => { const Icon = ICONS[d]; return (
          <button
            key={d}
            className={'dpad-' + d}
            aria-label={'drive ' + d}
            onPointerDown={press(d, true)}
            onPointerUp={press(d, false)}
            onPointerCancel={press(d, false)}
            onLostPointerCapture={press(d, false)}
          >
            <Icon size={22} />
          </button>
        )})}
      </div>
      <button className="touch-action touch-drift" aria-label="Hold to drift"
        onPointerDown={press('drift', true)} onPointerUp={press('drift', false)}
        onPointerCancel={press('drift', false)} onLostPointerCapture={press('drift', false)}>Drift</button>
      <button className="touch-action touch-reset" aria-label="Reset car to track"
        onPointerDown={press('reset', true)} onPointerUp={press('reset', false)}
        onPointerCancel={press('reset', false)} onLostPointerCapture={press('reset', false)}>Reset</button>
      <button
        className={'touch-action' + (current ? ' touch-action-hot' : '')}
        aria-label="Read nearby résumé stop"
        disabled={!current}
        onPointerDown={(e) => {
          e.preventDefault()
          if (current) focusExhibit(current)
        }}
      >
        <ArrowsOut size={22} />
      </button>
    </div>
  )
}
