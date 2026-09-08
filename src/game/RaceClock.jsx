import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { carState } from './layout.js'
import { useStore } from '../state/store.js'
import { resetSequence } from './input.js'
import { advanceLap, createLapTimer, formatLap, readBestLap, saveBestLap } from './lapTimer.js'

function localTime(value) {
  return value === null ? '—' : new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function RaceClock() {
  const storage = useMemo(() => { try { return window.localStorage } catch { return null } }, [])
  const saved = useMemo(() => readBestLap(storage), [storage])
  const timer = useRef(createLapTimer(saved.best))
  const persistent = useRef(saved.available)
  const paintAt = useRef(-Infinity)
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 960; canvas.height = 640
    const map = new THREE.CanvasTexture(canvas)
    map.colorSpace = THREE.SRGBColorSpace
    return map
  }, [])
  useEffect(() => () => texture.dispose(), [texture])
  useEffect(() => {
    const onVisibility = () => { timer.current.lastNow = null }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])
  useFrame(() => {
    const state = useStore.getState(), t = timer.current, now = performance.now()
    const paused = state.menuOpen || !!state.panel || !!state.exhibitFocus || document.hidden
    const lap = advanceLap(t, { x: carState.x, z: carState.z, now, wallTime: Date.now(), playing: state.phase === 'playing', automatic: state.autopilot, paused, resetVersion: resetSequence })
    if (lap?.record) persistent.current = saveBestLap(storage, lap.milliseconds)
    if (now - paintAt.current < 100) return
    paintAt.current = now
    const c = texture.image.getContext('2d')
    c.clearRect(0, 0, 960, 640)
    c.save(); c.beginPath(); c.roundRect(0, 0, 960, 640, 28); c.clip()
    c.fillStyle = '#f7f8f4'; c.fillRect(0, 0, 960, 640)
    c.fillStyle = '#e9ede5'; c.fillRect(0, 0, 960, 98)
    c.fillStyle = '#252925'; c.font = '700 40px "Manrope Variable", sans-serif'; c.fillText('Lap timer', 42, 64)
    c.textAlign = 'right'; c.font = '600 27px "Manrope Variable", sans-serif'
    c.fillText(t.status === 'tour' ? 'Guided tour · not timed' : paused && t.status === 'running' ? 'Paused' : t.status === 'running' ? `Lap ${t.laps + 1}` : 'Cross the line to start', 914, 61)
    c.textAlign = 'left'; c.font = '650 120px "Manrope Variable", sans-serif'; c.fillText(formatLap(t.elapsed), 40, 235)
    c.fillStyle = '#61675f'; c.font = '500 28px "Manrope Variable", sans-serif'
    c.fillText(persistent.current ? 'Best on this device' : 'Best this session', 44, 314)
    c.fillText('Last lap', 510, 314)
    c.fillStyle = '#a23720'; c.font = '700 52px "Manrope Variable", sans-serif'; c.fillText(formatLap(t.best), 42, 384)
    c.fillStyle = '#252925'; c.fillText(formatLap(t.lastLap), 510, 384)
    c.strokeStyle = '#dce2d6'; c.lineWidth = 2; c.beginPath(); c.moveTo(44, 432); c.lineTo(916, 432); c.stroke()
    c.fillStyle = '#61675f'; c.font = '500 27px "Manrope Variable", sans-serif'; c.fillText('Started', 44, 480); c.fillText('Last finish', 510, 480)
    c.fillStyle = '#252925'; c.font = '650 34px "Manrope Variable", sans-serif'; c.fillText(localTime(t.startedAt), 44, 531); c.fillText(localTime(t.finishedAt), 510, 531)
    c.fillStyle = '#61675f'; c.font = '500 25px "Manrope Variable", sans-serif'; c.fillText('Complete the circuit · manual driving', 44, 604)
    c.restore(); texture.needsUpdate = true
  })
  return <group name="race-lap-clock" position={[-3.7, 2.65, 18]} rotation={[0, .35, 0]}>
    <RoundedBox args={[3.72, 2.52, .2]} radius={.09} smoothness={4} position={[0, 0, -.12]} castShadow>
      <meshStandardMaterial color="#29372e" metalness={.3} roughness={.55} />
    </RoundedBox>
    <mesh><planeGeometry args={[3.6, 2.4]} /><meshBasicMaterial map={texture} transparent toneMapped={false} /></mesh>
    {[-1.15, 1.15].map(x => <mesh key={x} position={[x, -1.45, -.12]} castShadow><boxGeometry args={[.12, .7, .12]} /><meshStandardMaterial color="#29372e" roughness={.65} /></mesh>)}
  </group>
}
