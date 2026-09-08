import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Line } from '@react-three/drei'
import * as THREE from 'three'
import { RESUME } from '../data/resume.js'
import { carState } from './layout.js'
import { CONNECT_PAD as P, isConnectPadPressed } from './connectPad.js'
import { useStore, selectReducedMotion } from '../state/store.js'

function Label({ title, subtitle, width = 4.4, height = 1.1, color = '#a73321', onClick }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 300
    const c = canvas.getContext('2d')
    c.fillStyle = color; c.fillRect(0, 0, 1200, 300)
    c.fillStyle = '#fff1d6'; c.font = '800 90px system-ui'; c.textAlign = 'center'
    c.fillText(title, 600, subtitle ? 135 : 182)
    if (subtitle) { c.font = '500 42px system-ui'; c.fillText(subtitle, 600, 223) }
    const result = new THREE.CanvasTexture(canvas); result.colorSpace = THREE.SRGBColorSpace
    return result
  }, [title, subtitle, color])
  useEffect(() => () => texture.dispose(), [texture])
  return <mesh onClick={onClick ? e => { e.stopPropagation(); onClick() } : undefined} renderOrder={130}>
    <planeGeometry args={[width, height]} /><meshBasicMaterial map={texture} transparent depthTest={false} depthWrite={false} toneMapped={false} />
  </mesh>
}

export default function ConnectPad() {
  const [open, setOpen] = useState(false)
  const pressed = useRef(false), button = useRef()
  const reduced = useStore(selectReducedMotion)
  useEffect(() => {
    const close = e => { if (e.code === 'Escape') setOpen(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])
  useFrame((_, dt) => {
    const down = useStore.getState().phase === 'playing' && isConnectPadPressed(carState)
    if (down && !pressed.current) setOpen(true)
    pressed.current = down
    if (button.current) button.current.position.y = reduced ? (down ? .025 : .13) : THREE.MathUtils.damp(button.current.position.y, down ? .025 : .13, 14, Math.min(dt, .05))
    if (open && Math.hypot(carState.x - P.x, carState.z - P.z) > 7) setOpen(false)
  })
  const external = href => window.open(href, '_blank', 'noopener,noreferrer')
  return <group name="drive-on-connect-pad" position={[P.x, P.y, P.z]}>
    <Line points={[[-4.5, .18, -.3], [-2.7, .18, 0], [-1.7, .18, 0]]} color="#ffd080" lineWidth={4} dashed dashSize={.4} gapSize={.25} />
    <mesh position={[0, .015, 0]}><cylinderGeometry args={[1.65, 1.75, .07, 48]} /><meshStandardMaterial color="#32231e" roughness={.7} /></mesh>
    <mesh ref={button} position={[0, .13, 0]} castShadow><cylinderGeometry args={[P.radius, P.radius + .05, .11, 48]} /><meshStandardMaterial color={open ? '#f6b84e' : '#d84928'} emissive="#ef7332" emissiveIntensity={open ? .55 : .18} roughness={.38} metalness={.25} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .19, 0]}><ringGeometry args={[1.42, 1.51, 48]} /><meshBasicMaterial color="#ffe4ab" toneMapped={false} /></mesh>
    {[-1.8, 1.8].map(x => <mesh key={x} position={[x, 1.2, -.8]}><boxGeometry args={[.08, 2.4, .08]} /><meshStandardMaterial color="#493229" /></mesh>)}
    <Billboard position={[0, open ? 3.6 : 2.6, -.8]}>
      <Label title={open ? 'LET’S CONNECT' : 'CONNECT ↗'} subtitle={open ? 'Choose how to get in touch' : 'Drive onto the red button'} />
      {open && <group position={[0, -.9, .04]}>
        <Label title="Email Sarfraz" subtitle={RESUME.contact.email} color="#372923" onClick={() => { window.location.href = `mailto:${RESUME.contact.email}` }} />
        <group position={[-1.13, -.85, 0]}><Label title="LinkedIn ↗" width={2.15} height={.55} color="#6d3e2d" onClick={() => external(RESUME.contact.linkedin)} /></group>
        <group position={[1.13, -.85, 0]}><Label title="GitHub ↗" width={2.15} height={.55} color="#6d3e2d" onClick={() => external(RESUME.contact.github)} /></group>
        <group position={[0, -1.55, 0]}><Label title="Back to the track →" width={3} height={.5} color="#a73321" onClick={() => setOpen(false)} /></group>
      </group>}
    </Billboard>
  </group>
}
