import { List, X, SpeakerHigh, SpeakerSlash, Feather, FileText, DownloadSimple } from '@phosphor-icons/react'
import { useStore, selectReducedMotion, selectVisitedCount } from '../state/store.js'
import { setSoundEnabled } from '../lib/sound.js'
import { RESUME } from '../data/resume.js'
import { ZONES } from '../game/zones.js'

export default function TopBar() {
  const menuOpen = useStore(s => s.menuOpen)
  const soundOn = useStore(s => s.soundOn)
  const reduced = useStore(selectReducedMotion)
  const visited = useStore(selectVisitedCount)
  return <header className="topbar">
    <div className="topbar-left"><button className="menu-btn" aria-label="Résumé sections" aria-expanded={menuOpen} aria-controls="zone-menu" onClick={() => useStore.getState().toggleMenu()}>
      {menuOpen ? <X size={21} /> : <List size={21} />}<span className="identity"><b>Career circuit</b><span className="identity-role">Sarfraz Alam</span></span>
    </button><span className="topbar-progress" aria-label={`${visited} of ${ZONES.length} sections explored`}>{visited}/{ZONES.length}</span></div>
    <div className="topbar-right">
      <a className="btn btn-sm" aria-label="Download résumé" href={RESUME.resumeUrl} download><DownloadSimple size={18} /><span>Résumé</span></a>
      <button className="icon-btn" aria-label="Sound" aria-pressed={soundOn} onClick={() => { useStore.getState().toggleSound(); setSoundEnabled(!soundOn) }}>{soundOn ? <SpeakerHigh size={19} /> : <SpeakerSlash size={19} />}</button>
      <button className="icon-btn" aria-label="Reduced motion" aria-pressed={reduced} onClick={() => useStore.getState().toggleReducedMotion()}><Feather size={19} /></button>
      <button className="icon-btn" aria-label="Plain-text résumé" onClick={() => useStore.getState().togglePlain()}><FileText size={19} /></button>
    </div>
  </header>
}
