import { useEffect, useMemo } from 'react'
import Game from './game/Game.jsx'
import Hud from './ui/Hud.jsx'
import StartScreen from './ui/StartScreen.jsx'
import LoadingScreen from './ui/LoadingScreen.jsx'
import Fallback2D from './fallback/Fallback2D.jsx'
import { isWebGLAvailable } from './lib/webgl.js'
import { useKeyboard } from './game/input.js'
import { useStore } from './state/store.js'

export default function App() {
  useKeyboard()
  const webgl = useMemo(isWebGLAvailable, [])
  const phase = useStore((s) => s.phase)
  const plain = useStore((s) => s.plain)

  useEffect(() => {
    if (!webgl) return
    const t = setTimeout(() => useStore.getState().ready(), 900)
    return () => clearTimeout(t)
  }, [webgl])

  if (!webgl) return <Fallback2D reason="nowebgl" />
  if (plain) return <Fallback2D reason="user" />

  return (
    <main className="game-experience">
      <section className="game-pane" aria-label="Interactive career circuit">
        <Game />
        <Hud />
        {phase === 'start' && <StartScreen />}
        {phase === 'loading' && <LoadingScreen />}
      </section>
    </main>
  )
}
