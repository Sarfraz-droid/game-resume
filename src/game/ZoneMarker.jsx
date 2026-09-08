import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { selectReducedMotion } from '../state/store.js'
import { Billboard, Line } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../state/store.js'

function lines(ctx, text, width) {
  const words = text.split(/\s+/), result = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (line && ctx.measureText(next).width > width) { result.push(line); line = word } else line = next
  }
  if (line) result.push(line)
  return result
}

export function exhibitTexture(zone, page, index, count) {
  const canvas = document.createElement('canvas')
  canvas.width = 1200; canvas.height = 820
  const c = canvas.getContext('2d'), margin = 60, width = 1080
  c.fillStyle = '#2c211e'; c.fillRect(0, 0, 1200, 820)
  c.fillStyle = zone.color; c.fillRect(0, 0, 12, 820)
  c.font = '700 34px system-ui'
  c.fillText(`${String(zone.number).padStart(2, '0')} / ${zone.label.toUpperCase()}`, margin, 66)
  c.fillStyle = '#fff8e9'; c.font = '700 64px system-ui'
  let y = 155
  for (const line of lines(c, page.title, width)) { c.fillText(line, margin, y); y += 76 }
  y += 12
  c.fillStyle = '#e4c5a6'; c.font = '500 32px system-ui'
  for (const line of lines(c, page.kicker, width)) { c.fillText(line, margin, y); y += 42 }
  if (page.detail) {
    c.fillStyle = zone.color; c.font = '600 38px system-ui'
    for (const line of lines(c, page.detail, width)) { c.fillText(line, margin, y + 14); y += 48 }
  }
  y += 36
  const body = page.bullets.length ? page.bullets.join(' ') : page.metric
  let font = 48, bodyLines
  do { c.font = `500 ${font}px system-ui`; bodyLines = lines(c, body, width); if (y + bodyLines.length * (font + 14) <= 724) break; font -= 2 } while (font > 30)
  c.fillStyle = '#fff8e9'
  for (const line of bodyLines) { c.fillText(line, margin, y); y += font + 14 }
  c.fillStyle = zone.color; c.font = '600 30px system-ui'
  c.fillText(count > 1 ? `${index + 1} / ${count}   ·   Take your time · Continue when ready` : 'Take your time · Continue when ready', margin, 782)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  texture.userData.contentBottom = y
  texture.userData.canvasHeight = 820
  return texture
}

function Sculpture({ zone }) {
  if (zone.key === 'projects') return (
    <group position={[0, 0.3, 0]}>
      <mesh position={[0, 0.65, 0]}><cylinderGeometry args={[0.48, 0.18, 0.65, 8]} /><meshStandardMaterial color="#f4ca71" metalness={0.65} roughness={0.3} /></mesh>
      <mesh position={[0, 0.18, 0]}><cylinderGeometry args={[0.1, 0.1, 0.45, 8]} /><meshStandardMaterial color="#f4ca71" /></mesh>
      <mesh position={[0, 0.65, 0]}><torusGeometry args={[0.55, 0.065, 8, 16]} /><meshStandardMaterial color="#f4ca71" /></mesh>
    </group>
  )
  if (zone.key === 'education') return [0, 1, 2].map(i => (
    <mesh key={i} position={[0, 0.35 + i * 0.23, 0]} rotation={[0, i * 0.15, 0]}><boxGeometry args={[1.15, 0.18, 0.7]} /><meshStandardMaterial color={i % 2 ? '#fff4df' : zone.color} /></mesh>
  ))
  return [0, 1, 2].map(i => (
    <mesh key={i} position={[(i - 1) * 0.45, 0.3 + (i + 1) * 0.18, 0]} castShadow>
      <boxGeometry args={[0.32, (i + 1) * 0.36, 0.42]} />
      <meshStandardMaterial color={zone.color} emissive={zone.color} emissiveIntensity={0.1} metalness={0.2} roughness={0.45} />
    </mesh>
  ))
}

export default function ZoneMarker({ zone }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 800; canvas.height = 200
    const c = canvas.getContext('2d')
    c.fillStyle = '#2c211e'; c.fillRect(0, 0, 800, 200)
    c.fillStyle = zone.color; c.fillRect(0, 0, 10, 200)
    c.font = '700 46px system-ui'; c.fillText(`${zone.number.toString().padStart(2, '0')} / ${zone.label}`, 30, 80)
    c.fillStyle = '#f7f3e7'; c.font = '32px system-ui'; c.fillText('Drive closer to discover', 30, 145)
    const result = new THREE.CanvasTexture(canvas)
    result.colorSpace = THREE.SRGBColorSpace
    return result
  }, [zone])
  useEffect(() => () => texture.dispose(), [texture])
  const dx = zone.pos[0] - zone.road[0], dz = zone.pos[2] - zone.road[1]
  const length = Math.hypot(dx, dz)
  const tip = [zone.road[0] + dx / length * 2, 1.12, zone.road[1] + dz / length * 2]
  return (
    <group name={`resume-exhibit-${zone.key}`}>
      <Line points={[tip, [zone.pos[0], 1.12, zone.pos[2]]]} color={zone.color} lineWidth={2} dashed dashSize={0.3} gapSize={0.2} />
      <mesh position={tip} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.32, 0.43, 24]} /><meshBasicMaterial color={zone.color} depthWrite={false} /></mesh>
      <group position={zone.pos}>
        <mesh receiveShadow><cylinderGeometry args={[1.25, 1.4, 0.25, 32]} /><meshStandardMaterial color="#20383c" /></mesh>
        <Sculpture zone={zone} />
        {[-0.8, 0.8].map(x => <mesh key={x} position={[x, 0.75, 0]} castShadow><boxGeometry args={[0.08, 1.5, 0.08]} /><meshStandardMaterial color={zone.color} /></mesh>)}
        <Billboard position={[0, 1.8, 0]}>
          <mesh onClick={e => { e.stopPropagation(); useStore.getState().focusExhibit(zone.key) }}>
            <planeGeometry args={[2.8, .7]} />
            <meshBasicMaterial map={texture} toneMapped={false} />
          </mesh>
        </Billboard>
      </group>
    </group>
  )
}

function WorldButton({ label, position, width = 1.3, onClick, active }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 600; canvas.height = 160
    const c = canvas.getContext('2d')
    c.fillStyle = '#703c29'; c.fillRect(0, 0, 600, 160)
    c.strokeStyle = '#f0b36c'; c.lineWidth = 6; c.strokeRect(3, 3, 594, 154)
    c.fillStyle = '#fff8e9'; c.font = '600 65px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'
    c.fillText(label, 300, 80)
    const result = new THREE.CanvasTexture(canvas); result.colorSpace = THREE.SRGBColorSpace
    return result
  }, [label])
  useEffect(() => () => texture.dispose(), [texture])
  return <mesh position={position} renderOrder={125} onClick={e => { if (!active) return; e.stopPropagation(); onClick() }}>
    <planeGeometry args={[width, .4]} /><meshBasicMaterial map={texture} transparent depthTest={false} depthWrite={false} toneMapped={false} />
  </mesh>
}

function DetailCard({ zone, page, index, count, position, rotation, active, foreground = true }) {
  const texture = useMemo(() => exhibitTexture(zone, page, index, count), [zone, page, index, count])
  useEffect(() => () => texture.dispose(), [texture])
  return <group position={position} rotation={rotation}>
    <mesh position={[0, 0, -.075]} renderOrder={119}>
      <boxGeometry args={[4.28, 2.95, .14]} />
      <meshStandardMaterial color={zone.color} emissive={zone.color} emissiveIntensity={.12} transparent depthTest={!foreground} depthWrite={false} />
    </mesh>
    <mesh renderOrder={120} onClick={e => { if (!active) return; e.stopPropagation(); useStore.getState().dismissCards() }}>
      <planeGeometry args={[4.2, 2.87]} /><meshBasicMaterial map={texture} transparent depthTest={!foreground} depthWrite={false} toneMapped={false} />
    </mesh>
  </group>
}

export function PopupCards({ stop, permanent = false }) {
  const { zone } = stop
  const autopilot = useStore(s => s.autopilot)
  const interactive = useStore(s => s.phase === 'playing' && s.currentStop === stop.id && !s.cardsDismissed && !s.menuOpen)
  const nearby = useStore(s => s.currentStop === stop.id)
  const active = permanent || interactive
  const reduced = useStore(selectReducedMotion)
  const portrait = useThree(s => s.size.width < s.size.height)
  const root = useRef(), progress = useRef(0)
  const world = useMemo(() => new THREE.Vector3(), [])
  const pages = [stop.page]
  const shown = [0]
  useFrame(({ camera, size }, dt) => {
    const group = root.current
    if (!group) return
    progress.current = reduced || permanent ? Number(active) : THREE.MathUtils.damp(progress.current, Number(active), active ? 9 : 13, Math.min(dt, .05))
    const amount = progress.current
    group.visible = amount > .015
    group.position.y = 2.1 + amount * (portrait ? 1.5 : 1.1)
    group.getWorldPosition(world)
    const distance = camera.position.distanceTo(world)
    const height = 2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const deckWidth = !portrait && shown.length > 1 ? 8.8 : 4.4
    const deckHeight = portrait && shown.length > 1 ? 6.8 : 3.8
    world.project(camera)
    const safeWidth = Math.max(.01, .94 - Math.abs(world.x))
    const safeHeight = Math.max(.01, .9 - Math.abs(world.y))
    const cap = Math.min(1, height * Math.min(.5, safeHeight) / deckHeight, height * size.width / size.height * Math.min(portrait ? .82 : .52, safeWidth) / deckWidth)
    group.scale.setScalar(Math.max(.001, cap * amount))
  })
  const bottom = portrait && shown.length > 1 ? -3.2 : -1.9
  return <Billboard ref={root} visible={false} position={[0, 2.1, .2]}>
    {shown.map((i, slot) => <DetailCard active={interactive} foreground={!permanent || nearby} key={`${zone.key}-${slot}`} zone={zone} page={pages[i]} index={stop.pageIndex} count={stop.count}
      position={shown.length === 1 ? [0, 0, 0] : portrait ? [0, slot === 0 ? 1.55 : -1.55, slot * .1] : [slot === 0 ? -2.23 : 2.23, slot === 0 ? .12 : -.12, slot * .18]}
      rotation={[0, 0, portrait ? 0 : slot === 0 ? .025 : -.025]} />)}
    {(!permanent || (interactive && autopilot)) && <WorldButton active={interactive} label={autopilot ? "Continue →" : "Close ×"} width={1.9} position={[0, bottom, .25]} onClick={() => useStore.getState().dismissCards()} />}
  </Billboard>
}
