import { useEffect, useState } from 'react'
import { touch } from '../game/input.js'
import { useStore } from '../state/store.js'

const GLYPH = { up: '▲', down: '▼', left: '◀', right: '▶' }

export default function TouchControls() {
  const current = useStore((s) => s.current)
  const panel = useStore((s) => s.panel)
  const openPanel = useStore((s) => s.openPanel)
  const [on, setOn] = useState(false)

  useEffect(() => {
    setOn(window.matchMedia?.('(pointer:coarse)').matches || 'ontouchstart' in window)
    const clear = () => {
      touch.up = touch.down = touch.left = touch.right = false
    }
    window.addEventListener('pointerup', clear)
    window.addEventListener('pointercancel', clear)
    return () => {
      window.removeEventListener('pointerup', clear)
      window.removeEventListener('pointercancel', clear)
    }
  }, [])

  if (!on || panel) return null
  const press = (dir, v) => (e) => {
    e.preventDefault()
    touch[dir] = v
  }

  return (
    <div className="touch">
      <div className="dpad">
        {['up', 'down', 'left', 'right'].map((d) => (
          <button
            key={d}
            className={'dpad-' + d}
            aria-label={'drive ' + d}
            onPointerDown={press(d, true)}
            onPointerUp={press(d, false)}
            onPointerLeave={press(d, false)}
          >
            {GLYPH[d]}
          </button>
        ))}
      </div>
      <button
        className={'touch-action' + (current ? ' touch-action-hot' : '')}
        aria-label="open zone"
        onPointerDown={(e) => {
          e.preventDefault()
          if (current) openPanel(current, 'world')
        }}
      >
        {current ? '⤢' : '·'}
      </button>
    </div>
  )
}
