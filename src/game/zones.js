// The explorable destinations. `key` also names the info panel each one opens
// and is the id used for "visited" progress + the persistent menu.
//
// They're placed evenly around an oval loop road on the island; `layout.js`
// turns these into world positions.

export const ZONES = [
  { key: 'profile', label: 'Welcome Plaza', hint: 'Read the intro', icon: '👋', color: '#f2a65a', variant: 'plaza' },
  { key: 'skills', label: 'Skills District', hint: 'Browse the toolkit', icon: '⚡', color: '#4c9f70', variant: 'crystals' },
  { key: 'experience', label: 'Experience Road', hint: 'Walk the timeline', icon: '🛣️', color: '#6c8ea4', variant: 'gate' },
  { key: 'projects', label: 'Project Gallery', hint: 'View the work', icon: '🖼️', color: '#e06c5a', variant: 'billboard' },
  { key: 'education', label: 'The Library', hint: 'Check the shelves', icon: '📚', color: '#8f7ee0', variant: 'library' },
  { key: 'about', label: 'The Studio', hint: 'Say hello', icon: '🏕️', color: '#d9a441', variant: 'camp' },
  { key: 'contact', label: 'Contact Portal', hint: "Let's work together", icon: '📡', color: '#f2668b', variant: 'portal' },
]

export const zoneByKey = Object.fromEntries(ZONES.map((z) => [z.key, z]))
