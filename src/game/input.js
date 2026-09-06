import { useEffect } from 'react'
import { useStore } from '../state/store.js'

export const input = { up: false, down: false, left: false, right: false }
export const touch = { up: false, down: false, left: false, right: false }

const MAP = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
}

/** Global keyboard wiring. Mount once from <App>. */
export function useKeyboard() {
  useEffect(() => {
    const onDown = (e) => {
      const g = useStore.getState()
      const dir = MAP[e.code]
      if (dir && g.phase === 'playing' && !g.panel) input[dir] = true

      if (e.code === 'Escape') {
        if (g.panel) g.closePanel()
        else if (g.menuOpen) g.setMenu(false)
      }
      if ((e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') &&
        g.phase === 'playing' && !g.panel && g.current) {
        g.openPanel(g.current, 'world')
      }
      if (e.code === 'KeyC' && g.phase === 'playing' && !g.panel) g.cycleCam()
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault()
    }
    const onUp = (e) => {
      const dir = MAP[e.code]
      if (dir) input[dir] = false
    }
    const clear = () => {
      input.up = input.down = input.left = input.right = false
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    window.addEventListener('blur', clear)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      window.removeEventListener('blur', clear)
    }
  }, [])
}

export function readInput() {
  const up = input.up || touch.up
  const down = input.down || touch.down
  const left = input.left || touch.left
  const right = input.right || touch.right
  return {
    thr: (up ? 1 : 0) - (down ? 1 : 0),
    str: (left ? 1 : 0) - (right ? 1 : 0),
  }
}
