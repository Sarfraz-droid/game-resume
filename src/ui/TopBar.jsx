import { useStore, selectReducedMotion, selectVisitedCount } from '../state/store.js'
import { setSoundEnabled } from '../lib/sound.js'
import { RESUME } from '../data/resume.js'
import { ZONES } from '../game/zones.js'

export default function TopBar() {
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
            <b>Career circuit</b>
            <span className="identity-role">Explore the résumé</span>
          </span>
        </button>
        <span className="topbar-progress" title="Zones explored">
          {visited}/{ZONES.length}
        </span>
      </div>

      <div className="topbar-right">
        <a className="btn btn-sm" href={RESUME.resumeUrl} download>Résumé ↓</a>
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
