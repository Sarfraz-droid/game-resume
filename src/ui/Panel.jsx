import { useEffect, useRef } from 'react'
import { useStore } from '../state/store.js'
import { RESUME } from '../data/resume.js'
import { zoneByKey } from '../game/zones.js'
import { blip } from '../lib/sound.js'

function Chips({ items }) {
  return (
    <div className="chips">
      {items.map((i) => (
        <span key={i} className="chip">
          {i}
        </span>
      ))}
    </div>
  )
}

function Body({ k }) {
  const R = RESUME
  switch (k) {
    case 'profile':
      return (
        <>
          <p className="lead">{R.profile.bio}</p>
          <p className="muted">{R.profile.location}</p>
          <ul className="ticks">
            {R.profile.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      )
    case 'skills':
      return (
        <>
          {R.skills.map((g) => (
            <section key={g.group}>
              <h3>{g.group}</h3>
              <Chips items={g.items} />
            </section>
          ))}
        </>
      )
    case 'experience':
      return (
        <ol className="timeline">
          {R.experience.map((e, i) => (
            <li key={i}>
              <div className="tl-head">
                <b>{e.role}</b> · {e.company}
                <span className="tl-period">{e.period}</span>
              </div>
              <ul>
                {e.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )
    case 'projects':
      return (
        <div className="projects">
          {R.projects.map((p) => (
            <article key={p.name} className="project" style={{ '--accent': p.accent || '#e06c5a' }}>
              <div className="project-thumb" aria-hidden="true">
                {p.name.slice(0, 1)}
              </div>
              <div className="project-body">
                <h3>{p.name}</h3>
                <p>{p.blurb}</p>
                <Chips items={p.stack} />
                {p.outcome && <p className="project-outcome">↳ {p.outcome}</p>}
                <div className="project-links">
                  {p.github && (
                    <a className="btn btn-sm btn-ghost" href={p.github} target="_blank" rel="noopener noreferrer">
                      GitHub ↗
                    </a>
                  )}
                  {p.live && (
                    <a className="btn btn-sm btn-primary" href={p.live} target="_blank" rel="noopener noreferrer">
                      Live ↗
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )
    case 'education':
      return (
        <ol className="timeline">
          {R.education.map((e, i) => (
            <li key={i}>
              <div className="tl-head">
                <b>{e.title}</b>
                {e.org && <> · {e.org}</>}
                {e.period && <span className="tl-period">{e.period}</span>}
              </div>
              {e.detail && <p>{e.detail}</p>}
            </li>
          ))}
        </ol>
      )
    case 'about':
      return (
        <>
          <p className="lead">{R.about.story}</p>
          <h3>Interests</h3>
          <Chips items={R.about.interests} />
        </>
      )
    case 'contact':
      return (
        <>
          <p className="lead">Open to interesting roles and collaborations.</p>
          <div className="contact-grid">
            <a className="contact-row" href={`mailto:${R.contact.email}`}>
              <span>✉️</span> {R.contact.email}
            </a>
            <a className="contact-row" href={R.contact.linkedin} target="_blank" rel="noopener noreferrer">
              <span>in</span> LinkedIn ↗
            </a>
            <a className="contact-row" href={R.contact.github} target="_blank" rel="noopener noreferrer">
              <span>🐙</span> GitHub ↗
            </a>
            {R.resumeUrl && (
              <a className="contact-row" href={R.resumeUrl} target="_blank" rel="noopener noreferrer" download>
                <span>⬇</span> Download résumé (PDF)
              </a>
            )}
          </div>
          <a className="btn btn-primary btn-cta" href={`mailto:${R.contact.email}?subject=Let%27s%20work%20together`}>
            Let’s work together →
          </a>
        </>
      )
    default:
      return null
  }
}

export default function Panel() {
  const panelKey = useStore((s) => s.panel)
  const close = useStore((s) => s.closePanel)
  const ref = useRef()
  const zone = panelKey ? zoneByKey[panelKey] : null

  useEffect(() => {
    if (!panelKey) return
    blip('open')
    const el = ref.current
    el?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panelKey, close])

  if (!zone) return null
  return (
    <div className="panel-wrap" onClick={(e) => e.target === e.currentTarget && close()}>
      <div
        className="panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
        tabIndex={-1}
        ref={ref}
        style={{ '--accent': zone.color }}
      >
        <div className="panel-accent" />
        <header className="panel-head">
          <span className="panel-ico">{zone.icon}</span>
          <h2 id="panel-title">{zone.label}</h2>
          <button className="icon-btn panel-close" onClick={close} aria-label="Close">
            ✕
          </button>
        </header>
        <div className="panel-body">
          <Body k={panelKey} />
        </div>
        <footer className="panel-foot">
          <span className="panel-esc">Esc / click outside to close</span>
        </footer>
      </div>
    </div>
  )
}
