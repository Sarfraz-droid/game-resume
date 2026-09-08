import test from 'node:test'
import assert from 'node:assert/strict'
import { RESUME } from '../src/data/resume.js'
import { EXHIBITS } from '../src/data/exhibits.js'
import { zoneLayout } from '../src/game/layout.js'
import { useStore, selectReadingPause } from '../src/state/store.js'

test('every résumé role and project is available on a trackside display', () => {
  const experience = EXHIBITS.experience.flatMap(page => page.bullets)
  for (const role of RESUME.experience) for (const point of role.points) assert.ok(experience.includes(point), point)
  for (const project of RESUME.projects) assert.ok(EXHIBITS.projects.some(page => page.title === project.name && page.bullets.includes(project.blurb)))
  for (const zone of zoneLayout) assert.ok(EXHIBITS[zone.key].length > 0)
  assert.ok(RESUME.resumeUrl.endsWith('/Resume.pdf'))
})

test('checkpoint cards appear on arrival, dismiss until departure, and keep driving active', () => {
  useStore.setState({ current: null, cardsZone: null, cardsDismissed: false, phase: 'playing', exhibitPage: {}, autopilot: true })
  const s = useStore.getState()
  s.setCurrent('experience')
  assert.equal(useStore.getState().cardsZone, 'experience')
  assert.equal(useStore.getState().cardsDismissed, false)
  s.dismissCards()
  s.setCurrent('experience')
  assert.equal(useStore.getState().cardsDismissed, true)
  s.focusExhibit('experience')
  assert.equal(useStore.getState().cardsDismissed, false)
  s.focusExhibit('experience')
  assert.equal(useStore.getState().cardsZone, 'experience')
  assert.equal(useStore.getState().panel, null)
  assert.equal(useStore.getState().autopilot, true)
  s.setCurrent(null)
  assert.equal(useStore.getState().cardsZone, null)
  s.setCurrent('projects')
  assert.equal(useStore.getState().cardsZone, 'projects')
  assert.equal(useStore.getState().cardsDismissed, false)
})

test('driving signs stay compact and reading boards fit desktop and portrait screens', async () => {
  const { exhibitView } = await import('../src/game/exhibitView.js')
  for (const [width, height] of [[1440, 900], [390, 844], [320, 568], [844, 390]]) {
    const small = exhibitView(width, height, false)
    assert.equal(small.boardWidth, 2.8)
    assert.equal(small.boardHeight, 1.6)
    const view = exhibitView(width, height)
    const visibleHeight = 2 * view.distance * Math.tan(50 * Math.PI / 360)
    assert.ok(view.boardHeight / visibleHeight * height <= height - 190)
    assert.ok(view.boardWidth / (visibleHeight * width / height) * width <= width - 24)
  }
})

test('portrait reading keeps every fact and shows at most one bullet at a time', async () => {
  const { getExhibitPages } = await import('../src/data/exhibits.js')
  for (const key of Object.keys(EXHIBITS)) {
    const pages = getExhibitPages(key, true)
    assert.ok(pages.every(page => page.bullets.length <= 1))
    assert.deepEqual(pages.flatMap(page => page.bullets), EXHIBITS[key].flatMap(page => page.bullets))
  }
})

test('boards sit close to the road without putting their bases on its centerline', () => {
  for (const zone of zoneLayout) {
    const distance = Math.hypot(zone.pos[0] - zone.road[0], zone.pos[2] - zone.road[1])
    assert.ok(distance > 3.5 && distance <= 3.81)
  }
})

test('merged tour has nine well-spaced stops, with extras only for longer chapters', async () => {
  const { exhibitStops, nearestExhibitStop, tourMarkers } = await import('../src/game/exhibitStops.js')
  const { TOUR_CARDS } = await import('../src/data/tourCards.js')
  assert.equal(exhibitStops.length, 9)
  assert.equal(tourMarkers.length, 7)
  for (const zone of zoneLayout) {
    const stops = exhibitStops.filter(stop => stop.zone.key === zone.key)
    assert.equal(stops.length, TOUR_CARDS[zone.key].length)
    assert.equal(stops.length, ['experience', 'projects'].includes(zone.key) ? 2 : 1)
    for (const stop of stops) assert.equal(nearestExhibitStop(...stop.road, stop.heading)?.id, stop.id)
  }
  for (let i = 1; i < exhibitStops.length; i++) assert.ok(exhibitStops[i].distanceAlong - exhibitStops[i - 1].distanceAlong > 25)
  assert.equal(nearestExhibitStop(1000, 1000), null)
  const first = exhibitStops[0]
  assert.equal(nearestExhibitStop(...first.road, first.heading + Math.PI), null)
})

test('autopilot waits for reading until Continue; dismissed cards do not repeat', () => {
  useStore.setState({ currentStop: null, readStops: {}, autopilot: true, cardsDismissed: false, menuOpen: false, plain: false })
  const s = useStore.getState()
  s.setCurrentStop('profile-0', 'profile')
  assert.equal(selectReadingPause(useStore.getState()), true)
  s.dismissCards()
  assert.equal(selectReadingPause(useStore.getState()), false)
  s.setCurrentStop(null, null)
  s.setCurrentStop('profile-0', 'profile')
  assert.equal(useStore.getState().cardsDismissed, true)
  assert.equal(selectReadingPause(useStore.getState()), false)
  s.focusExhibit('profile')
  assert.equal(selectReadingPause(useStore.getState()), true)
  s.setAutopilot(false)
  assert.equal(selectReadingPause(useStore.getState()), false)
  s.setCurrentStop('skills-0', 'skills')
  assert.equal(useStore.getState().cardsDismissed, false)
  assert.equal(selectReadingPause(useStore.getState()), false)
})
