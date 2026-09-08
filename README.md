# Résumé Island 🏝️🚗

An explorable low-poly 3D game-résumé. Drive a little buggy around a floating
island and discover seven in-world résumé exhibits between the track lanes.
The supplied Resume.pdf provides the real experience, projects, skills,
education, research, and contact information.

Built with **React + Vite + [react-three-fiber](https://docs.pmnd.rs/react-three-fiber)**
(`drei` + `postprocessing` for the look).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in dist/
npm run preview
```

## Edit your content

**`src/data/resume.js`** contains the résumé transcribed from `Resume.pdf`.
`src/data/exhibits.js` arranges it into pages for the in-world displays. The
original PDF is bundled into the build and linked from Download Résumé.

## Where things live

| Area | File |
|---|---|
| Content | `src/data/resume.js` |
| Zones (labels, colours, panel keys) | `src/game/zones.js` |
| World size, scatter, collisions | `src/game/layout.js` |
| Ground, hills, water, road, fountain | `src/game/env/Island.jsx` |
| Instanced grass + wind shader | `src/game/env/Grass.jsx` |
| Flowers, mushrooms, reeds, pebbles | `src/game/env/Flora.jsx` |
| Trees (3 species), rocks, lamps | `src/game/env/Scenery.jsx` |
| Low-poly asset packs (forest, Japanese garden) | `src/game/kit.jsx` |
| Sky, sun, clouds, mountains, motes | `src/game/env/Sky.jsx` |
| Lighting + contact shadows | `src/game/Lighting.jsx` |
| Post-processing (bloom, vignette) | `src/game/Effects.jsx` |
| Vehicle + follow camera | `src/game/Car.jsx` |
| Fixed-step handling, drift, gravity, collisions | `src/game/vehiclePhysics.js` |
| Imported track surface sampling | `src/game/trackPhysics.js` |
| Road arrows, jump lights, braking signs | `src/game/CourseMarks.jsx` |
| Zone markers / interaction rings | `src/game/ZoneMarker.jsx` |
| HUD, menu, panels, minimap | `src/ui/*` |
| Plain-text fallback résumé | `src/fallback/Fallback2D.jsx` |

## Features

- Third-person follow camera (FOV ~50) with damping, look-ahead, speed zoom-out,
  approach zoom-in, panel lock-on and a restrained idle orbit
- Persistent **menu** — every section is reachable in one click without driving
- **WebGL fallback**: a semantic 2D résumé when WebGL is unavailable or on demand
- **Reduced-motion** toggle (also respects the OS setting) — kills sway, shake,
  wind and camera drift
- Optional **sound** (synthesised engine hum, off by default, no autoplay)
- Loading screen, on-screen touch controls, minimap, progress, `Download Résumé`

## Controls

**WASD / arrows** drive · **Space / Shift** hold to drift · **S / ↓** brake then reverse · **R** reset to track · **E / Enter** select the nearby résumé chapter · **Esc** close · on touch
devices an on-screen pad appears automatically.

For the jump, follow the mint arrows, line up straight, release drift, and hold
the throttle from the runway entrance. Brake after landing for the next bend.
The speed display shows km/h; skid marks and tyre smoke reflect actual sliding.

**P / Autopilot** drives continuous laps at a faster touring pace, brakes for bends, and accelerates for
jumps. It rejoins the course if enabled off-road or facing the wrong way and
recovers if stuck. Steering, throttle, braking, drift, or reset immediately
returns control to you. Menus and panels pause the pilot with the car.

**H / Drive assist** toggles gentle steering guidance, extra traction, and
corner braking (on by default). Assist does not add throttle and leaves reverse,
intentional drifting, and the jump run-up under your control.

## Deploy

`dist/` is a static site — GitHub Pages, Netlify, Vercel, etc. For Pages under a
repo subpath, set `base: '/<repo>/'` in `vite.config.js`.

## Trackside résumé

The game fills the viewport. Nine curated cards are evenly spaced by distance
along the circuit. Related facts are merged; only experience and projects need
an extra stop. Small markers and the minimap show the updated chapter locations.
The profile card stays on display in the 3D world, including after Continue or
leaving its stop. Other cards appear only at their own stops. Autopilot waits at each card until Continue or
Escape is pressed; manual driving stays under the player's control. Dismissed
cards do not automatically reappear on later laps, but E can reopen a nearby card.
The PDF and plain-text résumé retain the complete source details and project links.

## Connect pad

Drive off the outside of the start/finish bend onto the red CONNECT pad (x 5, z 27).
The physical button depresses under the grounded car and reveals 3D email,
LinkedIn and GitHub links. It rearms after driving off; Escape, Back to the track,
or driving away closes the links. No message is sent automatically.

The scene uses warm sunset lighting, a peach sky and charcoal/burnt-orange racing trim.
