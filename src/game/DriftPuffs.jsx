import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { carState } from './layout.js'
import { useStore, selectReducedMotion } from '../state/store.js'

const PUFF_COUNT = 24
const SPAWN_GAP = 0.075

export default function DriftPuffs() {
  const meshes = useRef([])
  const cursor = useRef(0)
  const lastSpawn = useRef(0)
  const particles = useMemo(
    () =>
      Array.from({ length: PUFF_COUNT }, () => ({
        active: false,
        age: 0,
        life: 0.7,
        vx: 0,
        vz: 0,
        spin: 0,
        baseY: 0,
      })),
    []
  )

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const reduced = selectReducedMotion(useStore.getState())
    const game = useStore.getState()
    const drifting = !reduced && game.phase === 'playing' && !game.panel && !game.menuOpen && carState.drifting
    const now = state.clock.elapsedTime

    if (drifting && now - lastSpawn.current > SPAWN_GAP) {
      lastSpawn.current = now
      const forwardX = Math.sin(carState.heading)
      const forwardZ = Math.cos(carState.heading)
      const rightX = Math.cos(carState.heading)
      const rightZ = -Math.sin(carState.heading)

      for (const side of [-0.46, 0.46]) {
        const index = cursor.current++ % PUFF_COUNT
        const particle = particles[index]
        const mesh = meshes.current[index]
        if (!mesh) continue

        particle.active = true
        particle.age = 0
        particle.life = 0.58 + Math.random() * 0.34
        particle.vx = -forwardX * (0.25 + Math.random() * 0.35) + rightX * side * 0.16
        particle.vz = -forwardZ * (0.25 + Math.random() * 0.35) + rightZ * side * 0.16
        particle.spin = (Math.random() - 0.5) * 1.8

        particle.baseY = carState.y + 0.08
        mesh.visible = true
        mesh.position.set(
          carState.x - forwardX * 0.525 + rightX * side,
          particle.baseY,
          carState.z - forwardZ * 0.525 + rightZ * side
        )
        mesh.rotation.set(0, Math.random() * Math.PI, 0)
      }
    }

    particles.forEach((particle, index) => {
      const mesh = meshes.current[index]
      if (!mesh || !particle.active) return
      particle.age += dt
      const progress = particle.age / particle.life
      if (progress >= 1 || reduced) {
        particle.active = false
        mesh.visible = false
        return
      }

      mesh.position.x += particle.vx * dt
      mesh.position.z += particle.vz * dt
      mesh.position.y = particle.baseY + progress * 0.62
      mesh.rotation.y += particle.spin * dt
      const size = 0.24 + progress * 0.72
      mesh.scale.set(size * 1.32, size * 0.92, size)
      mesh.material.opacity = Math.sin(progress * Math.PI) * 0.3
    })
  })

  return (
    <group>
      {particles.map((_, index) => (
        <mesh
          key={index}
          ref={(node) => (meshes.current[index] = node)}
          visible={false}
          renderOrder={2}
        >
          <sphereGeometry args={[0.52, 8, 6]} />
          <meshStandardMaterial
            color="#efd6a3"
            emissive="#c98e55"
            emissiveIntensity={0.08}
            roughness={1}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}
