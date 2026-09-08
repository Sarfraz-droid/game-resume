import { useEffect, useRef, useState } from 'react'
import { Billboard, Html, RoundedBox } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils } from 'three'
import { useStore, selectReadingPause, selectReducedMotion } from '../state/store.js'
import ResumeCard from '../ui/ResumeCard.jsx'
import { selectVisibleStop, worldCardFrame } from './worldCard.js'

function Display({ stop, size, focused, active, onExit }) {
  const root = useRef()
  const face = useRef()
  const amount = useRef(0)
  const finished = useRef(false)
  const reduced = useStore(selectReducedMotion)
  const frame = worldCardFrame(stop, size.width, size.height)
  if (!focused) { frame.height = Math.min(frame.height, 420); frame.worldHeight = frame.height / 80 }
  const displayScale = focused ? 1 : size.width < 700 ? .8 : .65
  useFrame((_, dt) => {
    if (!root.current) return
    const target = active ? 1 : 0
    amount.current = reduced ? target : MathUtils.damp(amount.current, target, active ? 10 : 13, Math.min(dt, .05))
    root.current.scale.setScalar(Math.max(.001, amount.current * displayScale))
    root.current.position.y = (amount.current - 1) * .55
    if (face.current) {
      face.current.style.opacity = MathUtils.smoothstep(amount.current, .1, .8)
      face.current.style.pointerEvents = active ? 'auto' : 'none'
    }
    if (!active && amount.current < .015 && !finished.current) {
      finished.current = true
      onExit()
    }
  })
  return <Billboard name={`career-card-${stop.id}`} follow={!focused} position={focused ? frame.center : [stop.pos[0], 3.4, stop.pos[2]]} rotation={focused ? [0, frame.rotation, 0] : [0, 0, 0]}>
    <group ref={root} scale={.001}>
      <RoundedBox args={[frame.worldWidth + .2, frame.worldHeight + .2, .22]} radius={.12} smoothness={4} position={[0, 0, -.13]} castShadow>
        <meshStandardMaterial color="#29372e" metalness={.45} roughness={.35} />
      </RoundedBox>
      <Html ref={face} transform distanceFactor={5} position={[0, 0, .015]} zIndexRange={[9, 1]} style={{ width: frame.width, height: frame.height, opacity: 0 }}>
        <div className="world-card-face" inert={!active ? '' : undefined}><ResumeCard displayStop={stop} /></div>
      </Html>
    </group>
  </Billboard>
}

export default function WorldResumeCard() {
  const stop = useStore(selectVisibleStop)
  const focused = useStore(s => !!s.exhibitFocus || selectReadingPause(s))
  const size = useThree(s => s.size)
  const [display, setDisplay] = useState(null)
  useEffect(() => {
    if (stop) setDisplay({ stop, focused })
  }, [stop, focused])
  if (!display) return null
  const active = stop?.id === display.stop.id
  return <Display key={`${display.stop.id}-${display.focused}`} stop={display.stop} size={size} focused={display.focused} active={active} onExit={() => setDisplay(null)} />
}
