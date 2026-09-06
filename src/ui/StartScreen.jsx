import { useStore } from '../state/store.js'
import { RESUME } from '../data/resume.js'
import { initSound, setSoundEnabled } from '../lib/sound.js'

const isTouch =
  typeof window !== 'undefined' && (window.matchMedia?.('(pointer:coarse)').matches || 'ontouchstart' in window)

export default function StartScreen() {
  const start = useStore((s) => s.start)
  const openPanel = useStore((s) => s.openPanel)
  const soundOn = useStore((s) => s.soundOn)
  const { name, role, bio } = RESUME.profile

  const begin = () => {
    initSound()
    setSoundEnabled(soundOn)
    start()
  }

  return (
    <div className="start" role="dialog" aria-label={`${name} — interactive résumé`}>
      <div className="start-card">
        <p className="start-kicker">Interactive résumé</p>
        <h1 className="start-name">{name}</h1>
        <p className="start-role">{role}</p>
        <p className="start-bio">{bio}</p>

        <div className="start-controls">
          {isTouch ? (
            <span>Use the on-screen pad to drive · tap a glowing marker to open it</span>
          ) : (
            <span>
              <b>WASD</b> / arrows to drive · <b>E</b> or <b>Space</b> to open a zone · <b>Esc</b> to close
            </span>
          )}
        </div>

        <div className="start-actions">
          <button className="btn btn-primary" onClick={begin} autoFocus>
            ▶ Start exploring
          </button>
          <button className="btn btn-ghost" onClick={() => { start(); openPanel('profile', 'menu') }}>
            Skip to the résumé
          </button>
        </div>
        <p className="start-foot">
          Prefer plain text? Every section is also in the menu, and there's a full text version linked there.
        </p>
      </div>
    </div>
  )
}
