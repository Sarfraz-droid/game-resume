import { useStore } from '../state/store.js'
import { zoneByKey } from '../game/zones.js'

const isTouch =
  typeof window !== 'undefined' && (window.matchMedia?.('(pointer:coarse)').matches || 'ontouchstart' in window)

export default function InteractionHint() {
  const current = useStore((s) => s.current)
  const panel = useStore((s) => s.panel)
  const zone = current ? zoneByKey[current] : null
  const show = !!zone && !panel

  return (
    <div className={'hint' + (show ? ' hint-show' : '')} aria-live="polite">
      {zone && (
        <>
          <span className="hint-ico">{zone.icon}</span>
          {isTouch ? 'Tap' : <kbd>E</kbd>} to open <b>{zone.label}</b>
        </>
      )}
    </div>
  )
}
