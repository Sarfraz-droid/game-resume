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
  assert.equal(nearestExhibitStop(...first.road, first.heading + Math.PI)?.id, first.id)
})

test('autopilot waits for reading until Continue and rearms on the next visit', () => {
  useStore.setState({ currentStop: null, readStops: {}, autopilot: true, cardsDismissed: false, menuOpen: false, plain: false })
  const s = useStore.getState()
  s.setCurrentStop('profile-0', 'profile')
  assert.equal(selectReadingPause(useStore.getState()), true)
  s.dismissCards()
  assert.equal(selectReadingPause(useStore.getState()), false)
  s.setCurrentStop(null, null)
  s.setCurrentStop('profile-0', 'profile')
  assert.equal(useStore.getState().cardsDismissed, false)
  assert.equal(selectReadingPause(useStore.getState()), true)
  s.focusExhibit('profile')
  assert.equal(selectReadingPause(useStore.getState()), true)
  s.setAutopilot(false)
  assert.equal(selectReadingPause(useStore.getState()), false)
  s.setCurrentStop('skills-0', 'skills')
  assert.equal(useStore.getState().cardsDismissed, false)
  assert.equal(selectReadingPause(useStore.getState()), false)
})

test('menu browsing opens the requested page and closing restores the circuit', () => {
  useStore.setState({ phase: 'playing', currentStop: 'profile-0', menuOpen: true, exhibitFocus: null, exhibitPage: {}, cardsDismissed: true, autopilot: true, plain: false })
  useStore.getState().browseStop('projects', 1)
  const state = useStore.getState()
  assert.equal(state.exhibitFocus, 'projects')
  assert.equal(state.exhibitPage.projects, 1)
  assert.equal(state.menuOpen, false)
  assert.equal(state.cardsDismissed, false)
  assert.equal(selectReadingPause(state), true)
  state.dismissCards()
  assert.equal(useStore.getState().exhibitFocus, null)
  assert.equal(selectReadingPause(useStore.getState()), false)
  assert.equal(useStore.getState().autopilot, true)
})

test('opening the section menu does not resume a paused tour', () => {
  useStore.setState({ currentStop: 'skills-0', exhibitFocus: null, cardsDismissed: false, autopilot: true, plain: false, menuOpen: false })
  useStore.getState().toggleMenu()
  assert.equal(selectReadingPause(useStore.getState()), true)
  useStore.getState().setMenu(false)
  assert.equal(selectReadingPause(useStore.getState()), true)
  useStore.getState().dismissCards()
  assert.equal(selectReadingPause(useStore.getState()), false)
})

test('trackside display camera fits portrait, desktop and landscape viewports', async () => {
  const { worldCardFrame, selectVisibleStop } = await import('../src/game/worldCard.js')
  const { exhibitStops } = await import('../src/game/exhibitStops.js')
  for (const [width, height] of [[1440, 900], [390, 844], [320, 568], [844, 390]]) {
    const frame = worldCardFrame(exhibitStops[0], width, height)
    const visibleHeight = 2 * frame.distance * Math.tan(50 * Math.PI / 360)
    assert.ok(frame.worldHeight / visibleHeight * height < height - 100)
    assert.ok(frame.worldWidth / (visibleHeight * width / height) * width < width - 40)
    assert.equal(frame.center[0], exhibitStops[0].pos[0])
    assert.equal(frame.center[2], exhibitStops[0].pos[2])
  }
  const state = { phase: 'playing', cardsDismissed: false, menuOpen: false, exhibitFocus: 'projects', exhibitPage: { projects: 1 }, currentStop: 'profile-0' }
  assert.equal(selectVisibleStop(state).id, 'projects-1')
  assert.equal(selectVisibleStop({ ...state, exhibitFocus: null }).id, 'profile-0')
  assert.equal(selectVisibleStop({ ...state, exhibitFocus: null, cardsDismissed: true })?.id, 'profile-0')
})

test('proximity cards stay open around the entry boundary and release beyond the exit radius', async () => {
  const { exhibitStops, nearestExhibitStop } = await import('../src/game/exhibitStops.js')
  const stop = exhibitStops[0]
  const x = stop.road[0], z = stop.road[1] + 5.5
  assert.equal(nearestExhibitStop(x, z, stop.heading), null)
  assert.equal(nearestExhibitStop(x, z, stop.heading, stop.id)?.id, stop.id)
  assert.equal(nearestExhibitStop(x, stop.road[1] + 7, stop.heading, stop.id), null)
})

test('end-of-circuit cards open when approaching their signs from either direction', async () => {
  const { exhibitStops, nearestExhibitStop } = await import('../src/game/exhibitStops.js')
  const { selectVisibleStop } = await import('../src/game/worldCard.js')
  for (const stop of exhibitStops.filter(stop => ['education', 'about', 'contact'].includes(stop.zone.key))) {
    useStore.setState({ phase: 'playing', autopilot: false, currentStop: null, exhibitFocus: null, menuOpen: false, cardsDismissed: false, readStops: {} })
    assert.equal(nearestExhibitStop(...stop.road, stop.heading + Math.PI)?.id, stop.id)
    const near = nearestExhibitStop(stop.pos[0], stop.pos[2], stop.heading + Math.PI)
    useStore.getState().setCurrentStop(near?.id || null, near?.zone.key || null)
    assert.equal(selectVisibleStop(useStore.getState())?.id, stop.id, `${stop.id} should open beside its sign`)
  }
})

test('manual driving rearms a dismissed final card after leaving its stop', async () => {
  const { selectVisibleStop } = await import('../src/game/worldCard.js')
  useStore.setState({ phase: 'playing', autopilot: false, currentStop: null, exhibitFocus: null, menuOpen: false, cardsDismissed: false, readStops: {} })
  const s = useStore.getState()
  s.setCurrentStop('contact-0', 'contact')
  s.dismissCards()
  s.setCurrentStop('contact-0', 'contact')
  assert.equal(selectVisibleStop(useStore.getState())?.id, 'contact-0')
  s.setCurrentStop(null, null)
  assert.equal(selectVisibleStop(useStore.getState()), undefined)
  s.setCurrentStop('contact-0', 'contact')
  assert.equal(selectVisibleStop(useStore.getState())?.id, 'contact-0')
})

test('final roadside markers have clear ground and do not overlap each other', async () => {
  const { loadTrack } = await import('./helpers/loadTrack.js')
  const { exhibitStops } = await import('../src/game/exhibitStops.js')
  const track = await loadTrack()
  const signs = exhibitStops.filter(stop => ['education', 'about', 'contact'].includes(stop.zone.key))
  for (const stop of signs) {
    const [x, , z] = stop.pos
    assert.equal(track.sample(x, z)?.road, false, `${stop.id} must sit on the verge`)
    const collisions = track.colliders.filter(c => x + 1 > c.minX && x - 1 < c.maxX && z + 1 > c.minZ && z - 1 < c.maxZ && c.maxY > 1.4)
    assert.equal(collisions.length, 0, `${stop.id} must clear the rocks, trees and buildings`)
    for (const other of signs) if (other !== stop) assert.ok(Math.hypot(x - other.pos[0], z - other.pos[2]) > 4)
  }
})

test('camera cycles only between follow and the angled three-quarter view', () => {
  useStore.getState().setCam('follow')
  useStore.getState().cycleCam()
  assert.equal(useStore.getState().camMode, 'angled')
  useStore.getState().cycleCam()
  assert.equal(useStore.getState().camMode, 'follow')
  useStore.getState().setCam('top')
  assert.equal(useStore.getState().camMode, 'follow')
})
