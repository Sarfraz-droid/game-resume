import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { useStore, selectReducedMotion } from '../../state/store.js'

function Dome() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 16
    c.height = 256
    const ctx = c.getContext('2d')
    const g = ctx.createLinearGradient(0, 0, 0, 256)
    g.addColorStop(0.0, '#8fb9e8')
    g.addColorStop(0.45, '#bfd9e6')
    g.addColorStop(0.75, '#f0e4cf')
    g.addColorStop(1.0, '#f8d9b0')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 16, 256)
    const t = new THREE.CanvasTexture(c)
    if ('SRGBColorSpace' in THREE) t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  return (
    <mesh>
      <sphereGeometry args={[440, 32, 16]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} fog={false} depthWrite={false} />
    </mesh>
  )
}

function Sun() {
  const glow = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const ctx = c.getContext('2d')
    const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 128)
    g.addColorStop(0, 'rgba(255,247,224,1)')
    g.addColorStop(0.25, 'rgba(255,231,178,0.7)')
    g.addColorStop(1, 'rgba(255,231,178,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 256)
    return new THREE.CanvasTexture(c)
  }, [])
  return (
    <group position={[120, 90, -180]}>
      <sprite scale={[130, 130, 1]}>
        <spriteMaterial map={glow} transparent depthWrite={false} fog={false} toneMapped={false} />
      </sprite>
      <mesh>
        <sphereGeometry args={[14, 24, 24]} />
        <meshBasicMaterial color="#fff6e0" fog={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Mountains() {
  const peaks = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => {
        const a = (i / 26) * Math.PI * 2
        const r = 155 + (i % 4) * 22
        return { x: Math.cos(a) * r, z: Math.sin(a) * r, h: 26 + (i % 5) * 12, w: 20 + (i % 3) * 10, far: i % 4 }
      }),
    []
  )
  return peaks.map((p, i) => (
    <mesh key={i} position={[p.x, p.h / 2 - 12, p.z]}>
      <coneGeometry args={[p.w, p.h, 5]} />
      <meshStandardMaterial color={p.far > 1 ? '#bcd0dd' : '#a7c1d2'} roughness={1} flatShading fog />
    </mesh>
  ))
}

function Archipelago() {
  const islets = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2 + 0.14
        const r = 86 + (i % 4) * 10
        return {
          x: Math.cos(a) * r,
          z: Math.sin(a) * r,
          s: 4.5 + (i % 5) * 1.35,
          h: 3.5 + (i % 3) * 1.6,
        }
      }),
    []
  )
  return (
    <group>
      <mesh position={[0, -4.15, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[330, 128]} />
        <meshStandardMaterial color="#5598a6" roughness={0.32} metalness={0.08} />
      </mesh>
      <mesh position={[0, -4.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[68, 325, 128]} />
        <meshStandardMaterial color="#82c0c2" roughness={0.18} transparent opacity={0.42} />
      </mesh>
      {islets.map((p, i) => (
        <group key={i} position={[p.x, -3.7, p.z]} rotation={[0, i * 1.17, 0]}>
          <mesh scale={[1.45, 1, 1]} castShadow receiveShadow>
            <cylinderGeometry args={[p.s * 0.72, p.s, p.h, 7]} />
            <meshStandardMaterial color="#6f7552" roughness={1} flatShading />
          </mesh>
          <mesh position={[0, p.h * 0.58, 0]} scale={[1.42, 0.42, 0.98]} castShadow>
            <dodecahedronGeometry args={[p.s * 0.72, 0]} />
            <meshStandardMaterial color={i % 3 ? '#648b55' : '#7ba15d'} roughness={1} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Clouds() {
  const grp = useRef([])
  const data = useMemo(
    () =>
      Array.from({ length: 10 }, () => ({
        x: -120 + Math.random() * 240,
        y: 34 + Math.random() * 28,
        z: -95 + Math.random() * 190,
        s: 1 + Math.random() * 1.8,
        spd: 0.4 + Math.random() * 0.8,
      })),
    []
  )
  useFrame((_, d) => {
    const reduced = selectReducedMotion(useStore.getState())
    const dt = Math.min(d, 0.05)
    grp.current.forEach((g, i) => {
      if (!g) return
      if (!reduced) g.position.x += data[i].spd * dt
      if (g.position.x > 140) g.position.x = -140
    })
  })
  return data.map((c, i) => (
    <group key={i} ref={(el) => (grp.current[i] = el)} position={[c.x, c.y, c.z]} scale={c.s}>
      {[
        [0, 0, 0, 3],
        [3.1, -0.3, 0.5, 2.2],
        [-2.9, -0.2, -0.4, 2.5],
        [1.2, 0.7, 0.2, 2.0],
      ].map(([x, y, z, r], k) => (
        <mesh key={k} position={[x, y, z]}>
          <sphereGeometry args={[r, 12, 10]} />
          <meshStandardMaterial color="#ffffff" roughness={1} emissive="#f2ede2" emissiveIntensity={0.2} fog={false} />
        </mesh>
      ))}
    </group>
  ))
}

export default function Sky() {
  const reduced = useStore(selectReducedMotion)
  return (
    <group>
      <Dome />
      <Sun />
      <Archipelago />
      <Mountains />
      <Clouds />
      {!reduced && (
        <>
          <Sparkles count={90} scale={[80, 26, 80]} position={[0, 14, 0]} size={2.4} speed={0.25} opacity={0.45} color="#fff2cf" />
          <Sparkles count={60} scale={[64, 4, 64]} position={[0, 2, 0]} size={1.6} speed={0.15} opacity={0.5} color="#ffe6a6" />
        </>
      )}
    </group>
  )
}
