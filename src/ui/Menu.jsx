import { User, Code, Briefcase, Stack, GraduationCap, Users, EnvelopeSimple, FileText, Check } from '@phosphor-icons/react'
const ICONS = { profile: User, skills: Code, experience: Briefcase, projects: Stack, education: GraduationCap, about: Users, contact: EnvelopeSimple }
import { useStore } from '../state/store.js'
import { ZONES } from '../game/zones.js'

export default function Menu() {
  const menuOpen = useStore((s) => s.menuOpen)
  const focusExhibit = useStore((s) => s.focusExhibit)
  const setMenu = useStore((s) => s.setMenu)
  const togglePlain = useStore((s) => s.togglePlain)
  const visited = useStore((s) => s.visited)

  if (!menuOpen) return null
  return (
    <nav id="zone-menu" className="menu" aria-label="Résumé sections">
      <p className="menu-title">Explore the résumé</p>
      <ul>
        {ZONES.map((z) => { const Icon = ICONS[z.key]; return (
          <li key={z.key}>
            <button onClick={() => focusExhibit(z.key)}>
              <Icon size={21} />
              <span className="menu-label">
                {z.label}
                <em>{z.hint}</em>
              </span>
              {visited[z.key] && <Check className="menu-check" size={18} />}
            </button>
          </li>
        )})}
      </ul>
      <button className="menu-plain" onClick={() => { setMenu(false); togglePlain() }}>
        <FileText size={18} /> Open plain-text résumé
      </button>
    </nav>
  )
}
