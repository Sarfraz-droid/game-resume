import { useEffect, useRef } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, X, MapPin, EnvelopeSimple, GithubLogo, LinkedinLogo, Check } from '@phosphor-icons/react'
import { useStore, selectReadingPause } from '../state/store.js'
import { exhibitStops } from '../game/exhibitStops.js'
import { RESUME } from '../data/resume.js'
import { selectVisibleStop } from '../game/worldCard.js'
import { clearInput } from '../game/input.js'

function Content({ stop }) {
  const { zone, page, pageIndex } = stop
  if (zone.key === 'skills') return <dl className="reader-skills">{RESUME.skills.map(group => <div key={group.group}><dt>{group.group}</dt><dd>{group.items.map(item => <span key={item}>{item}</span>)}</dd></div>)}</dl>
  if (zone.key === 'projects') return <div className="reader-projects">{RESUME.projects.slice(pageIndex * 2, pageIndex * 2 + 2).map(project => <article key={project.name}>
    <h3>{project.name}</h3><p>{project.blurb}</p><div className="reader-stack">{project.stack.join(' / ')}</div>
    {project.outcome && <p className="reader-outcome"><Check size={16} weight="bold" />{project.outcome}</p>}
    <a href={project.github || project.live} target="_blank" rel="noopener noreferrer">{project.github ? 'Explore the code' : 'View project'}<ArrowUpRight size={16} /></a>
  </article>)}</div>
  if (zone.key === 'contact') return <div className="reader-contact">
    <a href={`mailto:${RESUME.contact.email}`}><EnvelopeSimple size={22} /><span>Email me<strong>{RESUME.contact.email}</strong></span><ArrowUpRight size={18} /></a>
    <a href={RESUME.contact.github} target="_blank" rel="noopener noreferrer"><GithubLogo size={22} /><span>GitHub<strong>Sarfraz-droid</strong></span><ArrowUpRight size={18} /></a>
    <a href={RESUME.contact.linkedin} target="_blank" rel="noopener noreferrer"><LinkedinLogo size={22} /><span>LinkedIn<strong>Sarfraz Alam</strong></span><ArrowUpRight size={18} /></a>
    <p><MapPin size={16} />{RESUME.profile.location}</p>
  </div>
  return <div className={'reader-copy reader-copy-' + zone.key}>{page.bullets.map((text, i) => <p key={text}>{zone.key === 'experience' && <span className="reader-point" aria-hidden="true">{i + 1}</span>}{text}</p>)}
    {zone.key === 'profile' && <div className="reader-location"><MapPin size={16} />{RESUME.profile.location}</div>}
  </div>
}

export default function ResumeCard({ displayStop }) {
  const visibleStop = useStore(selectVisibleStop)
  const stop = displayStop || visibleStop
  const automatic = useStore(s => s.autopilot)
  const browsing = useStore(s => !!s.exhibitFocus)
  const reading = useStore(s => !!s.exhibitFocus || selectReadingPause(s))
  const content = useRef(null)
  const heading = useRef(null)
  useEffect(() => {
    if (!stop || !visibleStop) return
    if (reading) clearInput()
    useStore.getState().markVisited(stop.zone.key)
    content.current?.scrollTo(0, 0)
    if (reading) heading.current?.focus({ preventScroll: true })
  }, [stop, reading, visibleStop])
  if (!stop) return null
  const index = exhibitStops.findIndex(item => item.id === stop.id)
  const navigate = delta => {
    const next = exhibitStops[index + delta]
    if (next) useStore.getState().browseStop(next.zone.key, next.pageIndex)
  }
  return <section className={'resume-reader reader-kind-' + stop.zone.key} aria-labelledby="reader-title" onKeyDown={event => {
    if (event.key === 'Escape') { event.stopPropagation(); useStore.getState().dismissCards() }
  }}>
    <header className="reader-toolbar"><span>{stop.zone.label}</span>{!reading && <button className="reader-focus" onClick={() => useStore.getState().browseStop(stop.zone.key, stop.pageIndex)}>Read closer</button>}<span className="reader-position">Stop {index + 1} of {exhibitStops.length}</span><button onClick={() => useStore.getState().dismissCards()} aria-label="Close résumé card"><X size={20} /></button></header>
    <div className="reader-scroll" ref={content}>
      <h2 id="reader-title" ref={heading} tabIndex={-1} onClick={() => { if (!reading) useStore.getState().browseStop(stop.zone.key, stop.pageIndex) }}>{stop.page.title}</h2>
      {stop.page.detail && <p className="reader-detail">{stop.page.detail}</p>}
      {['experience', 'education'].includes(stop.zone.key) && <p className="reader-period">{stop.page.kicker.replace('EDUCATION · ', '')}</p>}
      <Content stop={stop} />
    </div>
    <footer className="reader-footer"><div className="reader-paging"><button disabled={index === 0} onClick={() => navigate(-1)} aria-label="Previous résumé stop"><ArrowLeft size={19} /></button><button disabled={index === exhibitStops.length - 1} onClick={() => navigate(1)} aria-label="Next résumé stop"><ArrowRight size={19} /></button></div><button className="reader-continue" onClick={() => useStore.getState().dismissCards()}>{automatic && !browsing ? 'Continue tour' : reading ? 'Back to circuit' : 'Keep driving'}<ArrowRight size={18} /></button></footer>
  </section>
}
