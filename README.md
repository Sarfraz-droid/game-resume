# Résumé Island 🏝️🚗

An explorable low-poly 3D game-résumé. Drive a little buggy around a floating
island and roll up to seven zones — Welcome Plaza, Skills District, Experience
Road, Project Gallery, The Library, The Studio, Contact Portal — to open elegant
info panels.

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

**`src/data/resume.js`** is the only file you normally touch — name, role, bio,
skills, experience, projects, education, about, contact, and `resumeUrl` (drop a
PDF in `/public` and set `"/resume.pdf"`). Add/remove entries freely; zones lay
themselves out.

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
| Vehicle + physics + follow camera | `src/game/Car.jsx` |
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

**WASD / arrows** drive · **E / Space** open a zone · **Esc** close · on touch
devices an on-screen pad appears automatically.

## Deploy

`dist/` is a static site — GitHub Pages, Netlify, Vercel, etc. For Pages under a
repo subpath, set `base: '/<repo>/'` in `vite.config.js`.
