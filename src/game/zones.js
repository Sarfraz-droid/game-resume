// The explorable destinations. `key` also names the info panel each one opens
// and is the id used for "visited" progress + the persistent menu.
//
// They're placed evenly around an oval loop road on the island; `layout.js`
// turns these into world positions.

export const ZONES = [
  { key: 'profile', label: 'Start · Profile', hint: 'Meet the driver', icon: 'P', color: '#ffc06b' },
  { key: 'skills', label: 'Skills Corner', hint: 'Core toolkit', icon: 'S', color: '#d0b171' },
  { key: 'experience', label: 'Experience Bend', hint: 'Career lap', icon: 'E', color: '#d79b74' },
  { key: 'projects', label: 'Project Chicane', hint: 'Selected work', icon: 'W', color: '#f08561' },
  { key: 'education', label: 'Education Straight', hint: 'Learning record', icon: 'Ed', color: '#d2b791' },
  { key: 'about', label: 'Research & Community', hint: 'Open source & public impact', icon: 'A', color: '#e1ad58' },
  { key: 'contact', label: 'Finish · Contact', hint: 'Start a conversation', icon: 'C', color: '#efa08a' },
]

export const zoneByKey = Object.fromEntries(ZONES.map((z) => [z.key, z]))
