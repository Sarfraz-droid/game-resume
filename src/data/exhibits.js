import { RESUME as R } from './resume.js'

const chunk = (items, count) => Array.from({ length: Math.ceil(items.length / count) }, (_, i) => items.slice(i * count, (i + 1) * count))
export const EXHIBITS = {
  profile: [
    { title: R.profile.name, kicker: 'FULL STACK + GENERATIVE AI', metric: 'Engineer. Builder.', detail: R.profile.role, bullets: [R.profile.bio, R.profile.location] },
    { title: 'The career circuit', kicker: 'FOUR TEAMS · ONE JOURNEY', metric: '2022 → now', bullets: R.profile.facts },
  ],
  skills: R.skills.map(group => ({ title: group.group, kicker: 'TECHNICAL TOOLKIT', metric: String(group.items.length).padStart(2, '0'), detail: 'Technologies', bullets: chunk(group.items, 3).map(items => items.join(' · ')) })),
  experience: R.experience.flatMap(job => chunk(job.points, 2).map((points, index) => ({
    title: job.company, kicker: `${job.period}${index ? ' · CONTINUED' : ''}`, metric: job.company.startsWith('Naukri') ? ['−50%', '+50%', '+100%', 'Protection'][index] : job.company.startsWith('Helium') ? 'AI + UI' : job.company.startsWith('Swiggy') ? 'Mobile' : 'Open source',
    detail: job.role, bullets: points,
  }))),
  projects: R.projects.map(project => ({ title: project.name, kicker: 'SELECTED PROJECT', metric: project.name.startsWith('Hardware') ? 'KAVACH ’23' : project.name === 'WayFinder' ? 'Agentic travel' : project.name === 'BLAH.JS' ? 'Build the UI' : 'LLM strategy', detail: project.outcome || 'Research paper', bullets: [project.blurb, project.stack.join(' · ')] })),
  education: R.education.map(item => ({ title: item.org, kicker: item.period, metric: item.detail, detail: item.title, bullets: [] })),
  about: [
    { title: 'Beyond the product', kicker: 'RESEARCH + COMMUNITY', metric: 'Public impact', bullets: [R.about.story, 'Rolling The Dice: studying LLM reasoning, planning, and long-term decisions through Monopoly.'] },
    { title: 'Built in the open', kicker: 'GOOGLE SUMMER OF CODE · 2022', metric: 'ScoReLab', bullets: R.experience[3].points },
  ],
  contact: [{ title: 'Let’s build something.', kicker: 'MOHAMMAD SARFRAZ ALAM', metric: 'Say hello', bullets: [R.contact.email, R.contact.phone, R.profile.location, 'GitHub · Sarfraz-droid', 'LinkedIn · Sarfraz Alam'] }],
}

const portraitPages = Object.fromEntries(Object.entries(EXHIBITS).map(([key, pages]) => [key,
  pages.flatMap(page => page.bullets.length > 1 ? page.bullets.map(bullet => ({ ...page, bullets: [bullet] })) : [page]),
]))
export const getExhibitPages = (key, portrait = false) => (portrait ? portraitPages : EXHIBITS)[key]
