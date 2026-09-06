import { useStore } from '../state/store.js'

const MODES = [
  ['follow', 'Follow', '🎥'],
  ['top', 'Top', '⬇'],
  ['side', 'Side', '↔'],
]

export default function CameraControl() {
  const mode = useStore((s) => s.camMode)
  const setCam = useStore((s) => s.setCam)

  return (
    <div className="camctl" role="group" aria-label="Camera view">
      {MODES.map(([m, label, ico]) => (
        <button
          key={m}
          type="button"
          className={'camctl-btn' + (mode === m ? ' is-on' : '')}
          aria-pressed={mode === m}
          onClick={() => setCam(m)}
          title={`${label} view — press C to cycle`}
        >
          <span aria-hidden>{ico}</span>
          <span className="camctl-label">{label}</span>
        </button>
      ))}
    </div>
  )
}
