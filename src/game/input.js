import { useEffect } from 'react'
import { useStore } from '../state/store.js'

const empty = () => ({ up: false, down: false, left: false, right: false, drift: false, reset: false })
export const input = empty()
export const touch = empty()
const held = new Set()
let resetRequested = false
export let resetSequence = 0
export function requestReset() { resetRequested = true; resetSequence++ }
const MAP = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  Space: 'drift', ShiftLeft: 'drift', ShiftRight: 'drift', KeyR: 'reset',
}
export function clearInput() {
  held.clear()
  resetRequested = false
  Object.assign(input, empty())
  Object.assign(touch, empty())
}
function syncKeys() {
  Object.assign(input, empty())
  for (const code of held) input[MAP[code]] = true
}

export function useKeyboard() {
  useEffect(() => {
    const onDown = (e) => {
      if (e.target?.closest?.('.exhibit-cards, .resume-reader, input, textarea, select, [contenteditable="true"]')) return
      if (['Space', 'Enter'].includes(e.code) && e.target?.closest?.('button, a')) return
      const g = useStore.getState()
      const driving = g.phase === 'playing' && !g.panel && !g.menuOpen && !g.plain && !g.exhibitFocus
      if (MAP[e.code] && driving) {
        e.preventDefault()
        if (g.exhibitFocus) g.focusExhibit(null)
        if (e.code === 'KeyR' && !e.repeat) requestReset()
        if (g.autopilot) g.setAutopilot(false)
        held.add(e.code)
        syncKeys()
      }
      if (e.repeat) return
      if (e.code === 'Escape') {
        g.dismissCards()
        if (g.exhibitFocus) g.focusExhibit(null)
        else if (g.panel) g.closePanel()
        else if (g.menuOpen) g.setMenu(false)
      }
      if ((e.code === 'KeyE' || e.code === 'Enter') && driving && g.current) g.focusExhibit(g.exhibitFocus ? null : g.current)
      if (e.code === 'KeyP' && driving) { e.preventDefault(); g.toggleAutopilot() }
      if (e.code === 'KeyH' && driving) g.toggleDriveAssist()
      if (e.code === 'KeyC' && driving) g.cycleCam()
    }
    const onUp = (e) => { held.delete(e.code); syncKeys() }
    const visibility = () => { if (document.hidden) clearInput() }
    const unsubscribe = useStore.subscribe((next, prev) => {
      if (next.exhibitFocus !== prev.exhibitFocus || next.panel !== prev.panel || next.menuOpen !== prev.menuOpen || next.phase !== prev.phase || next.plain !== prev.plain) clearInput()
    })
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    window.addEventListener('blur', clearInput)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      window.removeEventListener('blur', clearInput)
      document.removeEventListener('visibilitychange', visibility)
      unsubscribe()
      clearInput()
    }
  }, [])
}

export function readInput() {
  const reset = resetRequested || input.reset || touch.reset
  resetRequested = false
  return {
    thr: (input.up || touch.up ? 1 : 0) - (input.down || touch.down ? 1 : 0),
    str: (input.left || touch.left ? 1 : 0) - (input.right || touch.right ? 1 : 0),
    drift: input.drift || touch.drift,
    reset,
  }
}
