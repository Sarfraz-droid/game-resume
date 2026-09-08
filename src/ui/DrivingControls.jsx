import { useStore } from '../state/store.js'
import { clearInput } from '../game/input.js'

export default function DrivingControls() {
  const automatic = useStore(s => s.autopilot)
  const assisted = useStore(s => s.driveAssist)
  const hidden = useStore(s => !!s.panel || s.menuOpen || !!s.exhibitFocus)
  return (
    <div className="driving-controls" hidden={hidden} role="group" aria-label="Driving assistance">
      <button type="button" title="Follows the course and rejoins it if needed. Drive manually to take control." aria-pressed={automatic} onClick={() => { clearInput(); useStore.getState().toggleAutopilot() }}>
        Autopilot <b>{automatic ? 'On' : 'Off'}</b><kbd>P</kbd>
      </button>
      <button type="button" aria-pressed={assisted} onClick={() => useStore.getState().toggleDriveAssist()}>
        Drive assist <b>{assisted ? 'On' : 'Off'}</b><kbd>H</kbd>
      </button>
      <span>{automatic ? 'Steer or brake to take control' : 'Assist helps steer and brake for bends'}</span>
    </div>
  )
}
