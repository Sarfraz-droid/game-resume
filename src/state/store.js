import { create } from 'zustand'
import { ZONES } from '../game/zones.js'

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * One store for the whole app. The frame loop reads it with
 * `useStore.getState()` (no re-render); React reads it with `useStore(sel)`.
 */
export const useStore = create((set, get) => ({
  phase: 'loading', // 'loading' | 'start' | 'playing'
  current: null, // key of the zone the vehicle is next to
  panel: null, // key of the open info panel (same keys as zones), or null
  panelSource: null, // 'world' | 'menu'
  menuOpen: false,
  visited: {}, // { [key]: true }
  lastOpen: {}, // { [key]: timestamp } — throttles world auto-open

  soundOn: false,
  reducedMotionUser: null, // null = follow OS; true / false = manual override
  plain: false, // show the plain-text résumé instead of the 3D world
  camMode: 'follow', // 'follow' | 'top' | 'side'

  setPhase: (phase) => set({ phase }),
  ready: () => set((s) => (s.phase === 'loading' ? { phase: 'start' } : {})),
  start: () => set({ phase: 'playing' }),

  setCurrent: (key) => {
    if (get().current !== key) set({ current: key })
  },

  openPanel: (key, source = 'world') =>
    set((s) => ({
      panel: key,
      panelSource: source,
      menuOpen: false,
      visited: { ...s.visited, [key]: true },
      lastOpen: { ...s.lastOpen, [key]: Date.now() },
    })),
  closePanel: () => set({ panel: null, panelSource: null }),

  toggleMenu: () => set((s) => ({ menuOpen: !s.menuOpen })),
  setMenu: (menuOpen) => set({ menuOpen }),

  setCam: (camMode) => set({ camMode }),
  cycleCam: () =>
    set((s) => {
      const order = ['follow', 'top', 'side']
      return { camMode: order[(order.indexOf(s.camMode) + 1) % order.length] }
    }),

  togglePlain: () => set((s) => ({ plain: !s.plain })),
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
  toggleReducedMotion: () =>
    set((s) => ({
      reducedMotionUser: (s.reducedMotionUser ?? prefersReduced) ? false : true,
    })),
}))

/** Effective reduced-motion flag (manual override wins over OS preference). */
export const selectReducedMotion = (s) => s.reducedMotionUser ?? prefersReduced

export const selectVisitedCount = (s) => ZONES.filter((z) => s.visited[z.key]).length
