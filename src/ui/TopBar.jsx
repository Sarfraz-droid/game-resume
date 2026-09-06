import { useStore, selectReducedMotion, selectVisitedCount } from '../state/store.js'
import { RESUME } from '../data/resume.js'
import { setSoundEnabled } from '../lib/sound.js'
import { ZONES } from '../game/zones.js'

export default function TopBar() {
  const { name, role } = RESUME.profile
  const menuOpen = useStore((s) => s.menuOpen)
  const toggleMenu = useStore((s) => s.toggleMenu)
  const soundOn = useStore((s) => s.soundOn)
  const toggleSound = useStore((s) => s.toggleSound)
  const reduced = useStore(selectReducedMotion)
  const toggleReduced = useStore((s) => s.toggleReducedMotion)
  const togglePlain = useStore((s) => s.togglePlain)
  const visited = useStore(selectVisitedCount)

  const onSound = () => {
    const next = !soundOn
    toggleSound()
    setSoundEnabled(next)
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="menu-btn"
          aria-expanded={menuOpen}
          aria-controls="zone-menu"
          onClick={toggleMenu}
        >
          <span className="menu-ico">{menuOpen ? '✕' : '☰'}</span>
          <span className="identity">
            <b>{name}</b>
            <span className="identity-role">{role}</span>
          </span>
        </button>
        <span className="topbar-progress" title="Zones explored">
          {visited}/{ZONES.length}
        </span>
      </div>

      <div className="topbar-right">
        {RESUME.resumeUrl ? (
          <a className="btn btn-sm btn-primary" href={RESUME.resumeUrl} target="_blank" rel="noopener noreferrer" download>
            ⬇ Résumé
          </a>
        ) : (
          <button className="btn btn-sm btn-primary" onClick={() => togglePlain()} title="Add resumeUrl in src/data/resume.js for a real download">
            ⬇ Résumé
          </button>
        )}
        <button className="icon-btn" aria-pressed={soundOn} onClick={onSound} title="Sound">
          {soundOn ? '🔊' : '🔈'}
        </button>
        <button className="icon-btn" aria-pressed={reduced} onClick={toggleReduced} title="Reduced motion">
          {reduced ? '🐢' : '🌀'}
        </button>
        <button className="icon-btn" onClick={togglePlain} title="Plain-text résumé">
          📄
        </button>
      </div>
    </header>
  )
}
