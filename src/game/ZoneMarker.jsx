import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { emojiTexture, labelTexture } from './textures.js'
import { useStore, selectReducedMotion } from '../state/store.js'

function Structure({ variant, color }) {
  const mat = <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} flatShading />
  const glow = (
    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} toneMapped={false} roughness={0.4} />
  )
  switch (variant) {
    case 'crystals':
      return (
        <group>
          {[
            [0, 0, 1.4, 0],
            [-1.1, 0, 1.0, 0.4],
            [1.0, 0, 1.1, -0.5],
          ].map(([x, z, h, r], i) => (
            <mesh key={i} position={[x, h / 2 + 0.3, z]} rotation={[0, r, 0.08]} castShadow>
              <octahedronGeometry args={[0.55, 0]} />
              {i === 0 ? glow : mat}
            </mesh>
          ))}
          <mesh position={[0, 0.15, 0]} receiveShadow>
            <cylinderGeometry args={[1.7, 1.9, 0.3, 6]} />
            {mat}
          </mesh>
        </group>
      )
    case 'gate':
      return (
        <group>
          {[-1.3, 1.3].map((x) => (
            <mesh key={x} position={[x, 1.4, 0]} castShadow>
              <boxGeometry args={[0.5, 2.8, 0.5]} />
              {mat}
            </mesh>
          ))}
          <mesh position={[0, 3.0, 0]} castShadow>
            <boxGeometry args={[3.4, 0.5, 0.6]} />
            {glow}
          </mesh>
        </group>
      )
    case 'billboard':
      return (
        <group>
          <mesh position={[0, 1.0, 0]} castShadow>
            <boxGeometry args={[0.4, 2.0, 0.4]} />
            {mat}
          </mesh>
          <mesh position={[0, 2.6, 0]} castShadow>
            <boxGeometry args={[3.6, 2.1, 0.25]} />
            {mat}
          </mesh>
          <mesh position={[0, 2.6, 0.16]}>
            <planeGeometry args={[3.2, 1.7]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} toneMapped={false} />
          </mesh>
        </group>
      )
    case 'library':
      return (
        <group>
          <mesh position={[0, 1.1, 0]} castShadow>
            <boxGeometry args={[3, 2.2, 2]} />
            {mat}
          </mesh>
          <mesh position={[0, 2.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[2.4, 1.1, 4]} />
            {glow}
          </mesh>
        </group>
      )
    case 'camp':
      return (
        <group>
          <mesh position={[0, 1.0, 0]} rotation={[0, Math.PI / 5, 0]} castShadow>
            <coneGeometry args={[1.7, 2.4, 4]} />
            {mat}
          </mesh>
          <mesh position={[0, 0.25, 1.2]}>
            <icosahedronGeometry args={[0.4, 0]} />
            {glow}
          </mesh>
        </group>
      )
    case 'portal':
      return (
        <group>
          <mesh position={[0, 2.2, 0]} castShadow>
            <torusGeometry args={[1.7, 0.28, 14, 40]} />
            {glow}
          </mesh>
          <mesh position={[0, 2.2, 0]}>
            <circleGeometry args={[1.5, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.28} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.2, 0]} receiveShadow>
            <cylinderGeometry args={[1.9, 2.1, 0.4, 8]} />
            {mat}
          </mesh>
        </group>
      )
    default: // plaza
      return (
        <group>
          <mesh position={[0, 0.2, 0]} receiveShadow>
            <cylinderGeometry args={[2.4, 2.6, 0.4, 20]} />
            {mat}
          </mesh>
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.34, 2.4, 10]} />
            {mat}
          </mesh>
          <mesh position={[0, 2.9, 0]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            {glow}
          </mesh>
        </group>
      )
  }
}

export default function ZoneMarker({ zone }) {
  const { key, pos, label, hint, icon, color, variant } = zone
  const active = useStore((s) => s.current === key)
  const visited = useStore((s) => !!s.visited[key])

  const ring = useRef()
  const iconRef = useRef()
  const iconTex = useMemo(() => emojiTexture(icon), [icon])
  const labelTex = useMemo(() => labelTexture(label, visited ? '✓ visited' : hint), [label, hint, visited])
  const checkTex = useMemo(() => emojiTexture('✓', 170), [])

  useFrame((s) => {
    const reduced = selectReducedMotion(useStore.getState())
    const t = s.clock.elapsedTime
    if (ring.current) {
      const base = visited ? 0.5 : 0.32
      ring.current.material.opacity = reduced
        ? base + 0.15
        : base + Math.abs(Math.sin(t * 2 + pos[0])) * (active ? 0.5 : 0.28)
      const sc = active ? 1.12 : 1
      ring.current.scale.setScalar(reduced ? 1 : sc + Math.sin(t * 2) * 0.02)
    }
    if (iconRef.current) {
      iconRef.current.scale.setScalar(active ? 1.5 : 1.15)
    }
  })

  return (
    <group position={pos}>
      <Structure variant={variant} color={color} />

      {/* interaction ring on the ground */}
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[2.5, 3.1, 40]} />
        <meshBasicMaterial color={visited ? '#7ecb8f' : color} transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* floating icon */}
      <Float speed={2} floatIntensity={0.8} rotationIntensity={0.2}>
        <sprite ref={iconRef} position={[0, 4.4, 0]} scale={1.15}>
          <spriteMaterial map={visited ? checkTex : iconTex} transparent toneMapped={false} />
        </sprite>
      </Float>

      {/* name plate */}
      <Billboard position={[0, 5.7, 0]}>
        <mesh scale={[3.2, 1.0, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={labelTex} transparent toneMapped={false} depthWrite={false} />
        </mesh>
      </Billboard>
    </group>
  )
}
