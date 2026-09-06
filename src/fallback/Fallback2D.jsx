import { RESUME } from '../data/resume.js'
import { useStore } from '../state/store.js'

export default function Fallback2D({ reason }) {
  const plain = useStore((s) => s.plain)
  const togglePlain = useStore((s) => s.togglePlain)
  const R = RESUME

  return (
    <main className="plain">
      <div className="plain-inner">
        {reason === 'nowebgl' ? (
          <p className="plain-note">
            Your browser doesn’t support the 3D view, so here’s the plain résumé.
          </p>
        ) : (
          <button className="btn btn-ghost plain-back" onClick={togglePlain}>
            ← Back to the 3D world
          </button>
        )}

        <header className="plain-head">
          <h1>{R.profile.name}</h1>
          <p className="plain-role">{R.profile.role}</p>
          <p>{R.profile.bio}</p>
          <p className="muted">{R.profile.location}</p>
          <p className="plain-links">
            <a href={`mailto:${R.contact.email}`}>{R.contact.email}</a>
            {' · '}
            <a href={R.contact.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            {' · '}
            <a href={R.contact.github} target="_blank" rel="noopener noreferrer">GitHub</a>
            {R.resumeUrl && (
              <>
                {' · '}
                <a href={R.resumeUrl} target="_blank" rel="noopener noreferrer" download>Résumé PDF</a>
              </>
            )}
          </p>
        </header>

        <section>
          <h2>Skills</h2>
          {R.skills.map((g) => (
            <p key={g.group}>
              <b>{g.group}:</b> {g.items.join(', ')}
            </p>
          ))}
        </section>

        <section>
          <h2>Experience</h2>
          {R.experience.map((e, i) => (
            <article key={i}>
              <h3>
                {e.role} · {e.company} <span className="muted">{e.period}</span>
              </h3>
              <ul>
                {e.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section>
          <h2>Projects</h2>
          {R.projects.map((p) => (
            <article key={p.name}>
              <h3>{p.name}</h3>
              <p>{p.blurb}</p>
              <p className="muted">Stack: {p.stack.join(', ')}</p>
              {p.outcome && <p className="muted">Outcome: {p.outcome}</p>}
              <p>
                {p.github && (
                  <a href={p.github} target="_blank" rel="noopener noreferrer">GitHub</a>
                )}
                {p.github && p.live && ' · '}
                {p.live && (
                  <a href={p.live} target="_blank" rel="noopener noreferrer">Live</a>
                )}
              </p>
            </article>
          ))}
        </section>

        <section>
          <h2>Education</h2>
          {R.education.map((e, i) => (
            <article key={i}>
              <h3>
                {e.title} {e.org && <>· {e.org}</>} <span className="muted">{e.period}</span>
              </h3>
              {e.detail && <p>{e.detail}</p>}
            </article>
          ))}
        </section>

        <section>
          <h2>About</h2>
          <p>{R.about.story}</p>
          <p className="muted">Interests: {R.about.interests.join(', ')}</p>
        </section>

        <footer className="plain-foot">
          <a className="btn btn-primary" href={`mailto:${R.contact.email}?subject=Let%27s%20work%20together`}>
            Let’s work together →
          </a>
        </footer>
      </div>
    </main>
  )
}
