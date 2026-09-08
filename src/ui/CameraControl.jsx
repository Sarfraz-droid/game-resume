import { VideoCamera, Cube } from '@phosphor-icons/react'
import { useStore } from '../state/store.js'

const MODES = [
  ['follow', 'Follow', VideoCamera],
  ['angled', 'Angled', Cube],
]

export default function CameraControl() {
  const mode = useStore((s) => s.camMode)
  const setCam = useStore((s) => s.setCam)

  return (
    <div className="camctl" role="group" aria-label="Camera view">
      {MODES.map(([m, label, Icon]) => (
        <button
          key={m}
          type="button"
          className={'camctl-btn' + (mode === m ? ' is-on' : '')}
          aria-pressed={mode === m}
          aria-label={`${label} camera`}
          onClick={() => setCam(m)}
          title={`${label} view — press C to cycle`}
        >
          <Icon size={18} aria-hidden="true" />
          <span className="camctl-label">{label}</span>
        </button>
      ))}
    </div>
  )
}
