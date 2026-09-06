import { useStore } from '../state/store.js'
import { ZONES } from '../game/zones.js'

export default function Menu() {
  const menuOpen = useStore((s) => s.menuOpen)
  const openPanel = useStore((s) => s.openPanel)
  const setMenu = useStore((s) => s.setMenu)
  const togglePlain = useStore((s) => s.togglePlain)
  const visited = useStore((s) => s.visited)

  if (!menuOpen) return null
  return (
    <nav id="zone-menu" className="menu" aria-label="Résumé sections">
      <p className="menu-title">Jump to a section</p>
      <ul>
        {ZONES.map((z) => (
          <li key={z.key}>
            <button onClick={() => openPanel(z.key, 'menu')}>
              <span className="menu-ico-emoji">{z.icon}</span>
              <span className="menu-label">
                {z.label}
                <em>{z.hint}</em>
              </span>
              {visited[z.key] && <span className="menu-check">✓</span>}
            </button>
          </li>
        ))}
      </ul>
      <button className="menu-plain" onClick={() => { setMenu(false); togglePlain() }}>
        📄 Open plain-text résumé
      </button>
    </nav>
  )
}
