import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  ISLAND_R,
  LOOP_RX,
  LOOP_RZ,
  LOOP_R_AVG,
  ROAD_HALF,
  PATH_HALF,
  PLAZA_R,
  footpaths,
  fencePosts,
  treehouse,
  FENCE_R,
} from '../layout.js'
import { Model, hasModel } from '../models.jsx'

function Ground() {
  const geo = useMemo(() => {
    const rings = 24
    const segments = 128
    const positions = [0, 0, 0]
    const colors = []
    const indices = []
    const c = new THREE.Color()
    const cA = new THREE.Color('#84b84e') // bright meadow
    const cB = new THREE.Color('#72a742') // shadowed grass
    const cSand = new THREE.Color('#c9b487') // path dust
    const loopBand = (ROAD_HALF + 1) / LOOP_R_AVG
    const paint = (x, y) => {
      const d = Math.hypot(x, y)
      const rim = Math.max(0, (d - ISLAND_R * 0.78) / (ISLAND_R * 0.22))
      const patch = (Math.sin(x * 0.35) * Math.cos(y * 0.4) + 1) * 0.5
      c.copy(cA).lerp(cB, patch * 0.8)
      const nearLoop = 1 - Math.min(1, Math.abs(Math.hypot(x / LOOP_RX, y / LOOP_RZ) - 1) / loopBand)
      if (nearLoop > 0) c.lerp(cSand, nearLoop * 0.7)
      if (d < PLAZA_R) c.lerp(cSand, (1 - d / PLAZA_R) * 0.5)
      if (rim > 0.6) c.lerp(cSand, (rim - 0.6) * 1.2)
      colors.push(c.r, c.g, c.b)
      return (Math.sin(x * 0.2) * Math.cos(y * 0.17) + Math.sin(d * 0.38) * 0.45) * 0.025 + rim * rim * 0.18
    }
    paint(0, 0)
    for (let ring = 1; ring <= rings; ring++) {
      const r = (ring / rings) * ISLAND_R
      for (let j = 0; j < segments; j++) {
        const a = (j / segments) * Math.PI * 2
        const x = Math.cos(a) * r
        const y = Math.sin(a) * r
        positions.push(x, y, paint(x, y))
      }
    }
    for (let j = 0; j < segments; j++) indices.push(0, 1 + j, 1 + ((j + 1) % segments))
    for (let ring = 1; ring < rings; ring++) {
      const inner = 1 + (ring - 1) * segments
      const outer = 1 + ring * segments
      for (let j = 0; j < segments; j++) {
        const next = (j + 1) % segments
        indices.push(inner + j, outer + j, outer + next, inner + j, outer + next, inner + next)
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    g.setIndex(indices)
    g.computeVertexNormals()
    return g
  }, [])
  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} />
    </mesh>
  )
}

function TrackDetails() {
  const coralCurbs = useRef()
  const creamCurbs = useRef()
  const dashes = useRef()
  const curbCount = 96
  const curbsPerColor = curbCount / 2
  const dashCount = 32

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D()
    let coralIndex = 0
    let creamIndex = 0
    for (let i = 0; i < curbCount; i++) {
      const a = (i / curbCount) * Math.PI * 2
      const side = i % 2 ? 1 : -1
      const rx = LOOP_RX + side * (ROAD_HALF - 0.18)
      const rz = LOOP_RZ + side * (ROAD_HALF - 0.18)
      const tangentX = -rx * Math.sin(a)
      const tangentZ = rz * Math.cos(a)
      dummy.position.set(Math.cos(a) * rx, 0.12, Math.sin(a) * rz)
      dummy.rotation.set(0, Math.atan2(tangentX, tangentZ), 0)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      if (Math.floor(i / 2) % 2) coralCurbs.current.setMatrixAt(coralIndex++, dummy.matrix)
      else creamCurbs.current.setMatrixAt(creamIndex++, dummy.matrix)
    }
    coralCurbs.current.instanceMatrix.needsUpdate = true
    creamCurbs.current.instanceMatrix.needsUpdate = true

    for (let i = 0; i < dashCount; i++) {
      const a = (i / dashCount) * Math.PI * 2
      const tangentX = -LOOP_RX * Math.sin(a)
      const tangentZ = LOOP_RZ * Math.cos(a)
      dummy.position.set(Math.cos(a) * LOOP_RX, 0.1, Math.sin(a) * LOOP_RZ)
      dummy.rotation.set(0, Math.atan2(tangentX, tangentZ), 0)
      dummy.updateMatrix()
      dashes.current.setMatrixAt(i, dummy.matrix)
    }
    dashes.current.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <group>
      <instancedMesh ref={coralCurbs} args={[undefined, undefined, curbsPerColor]} castShadow receiveShadow>
        <boxGeometry args={[0.48, 0.16, 1.7]} />
        <meshStandardMaterial color="#e8663f" roughness={0.88} />
      </instancedMesh>
      <instancedMesh ref={creamCurbs} args={[undefined, undefined, curbsPerColor]} castShadow receiveShadow>
        <boxGeometry args={[0.48, 0.16, 1.7]} />
        <meshStandardMaterial color="#fff3d8" roughness={0.88} />
      </instancedMesh>
      <instancedMesh ref={dashes} args={[undefined, undefined, dashCount]} receiveShadow>
        <boxGeometry args={[0.13, 0.035, 2.1]} />
        <meshStandardMaterial color="#fff7e5" roughness={0.9} />
      </instancedMesh>
      <StartGate />
    </group>
  )
}

function StartGate() {
  return (
    <group position={[0, 0, LOOP_RZ]}>
      {[-ROAD_HALF + 0.25, ROAD_HALF - 0.25].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[0, 2.1, 0]} castShadow>
            <cylinderGeometry args={[0.13, 0.18, 4.2, 8]} />
            <meshStandardMaterial color="#252830" roughness={0.55} metalness={0.28} />
          </mesh>
          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.38, 0.48, 0.36, 8]} />
            <meshStandardMaterial color="#e8663f" roughness={0.75} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 4.05, 0]} castShadow>
        <boxGeometry args={[0.28, 0.7, ROAD_HALF * 2]} />
        <meshStandardMaterial color="#252830" roughness={0.5} metalness={0.2} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-0.17, 4.05, -ROAD_HALF + 0.55 + i * 1.02]}>
          <boxGeometry args={[0.06, 0.42, 0.5]} />
          <meshStandardMaterial color={i % 2 ? '#fff3d8' : '#e8663f'} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}


function Underside() {
  return (
    <group>
      <mesh position={[0, -1.7, 0]}>
        <cylinderGeometry args={[ISLAND_R + 0.6, ISLAND_R - 4, 3.4, 72]} />
        <meshStandardMaterial color="#8a6b47" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, -16.4, 0]}>
        <coneGeometry args={[ISLAND_R - 6, 26, 12]} />
        <meshStandardMaterial color="#6f5537" roughness={1} flatShading />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * (ISLAND_R - 9), -10 - i * 1.4, Math.sin(a) * (ISLAND_R - 11)]}
            rotation={[i, a, 0.4]}
          >
            <dodecahedronGeometry args={[2 + (i % 2), 0]} />
            <meshStandardMaterial color="#7a5e3d" roughness={1} flatShading />
          </mesh>
        )
      })}
    </group>
  )
}

function LoopRoad() {
  const band = ROAD_HALF / LOOP_R_AVG // road half-width as a ring fraction
  const shoulder = (ROAD_HALF + 1.1) / LOOP_R_AVG
  return (
    <group>
      {/* soft shoulder */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} scale={[LOOP_RX, LOOP_RZ, 1]}>
        <ringGeometry args={[1 - shoulder, 1 + shoulder, 160]} />
        <meshStandardMaterial color="#c2ad82" roughness={1} transparent opacity={0.55} />
      </mesh>
      {/* paved lane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} scale={[LOOP_RX, LOOP_RZ, 1]} receiveShadow>
        <ringGeometry args={[1 - band, 1 + band, 160]} />
        <meshStandardMaterial color="#d8c39a" roughness={1} />
      </mesh>
      {/* dashed centre line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.065, 0]} scale={[LOOP_RX, LOOP_RZ, 1]}>
        <ringGeometry args={[1 - 0.006, 1 + 0.006, 96, 1]} />
        <meshStandardMaterial color="#f3ead2" roughness={1} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

function Footpaths() {
  return (
    <group>
      {footpaths.map((p, i) => (
        <group key={i}>
          <mesh
            position={[p.mid[0], 0.035, p.mid[1]]}
            rotation={[-Math.PI / 2, 0, -p.angle]}
            receiveShadow
          >
            <planeGeometry args={[PATH_HALF * 2, p.length]} />
            <meshStandardMaterial color="#d7c6a0" roughness={1} />
          </mesh>
          <mesh position={[p.mid[0], 0.02, p.mid[1]]} rotation={[-Math.PI / 2, 0, -p.angle]}>
            <planeGeometry args={[PATH_HALF * 2 + 1.1, p.length]} />
            <meshStandardMaterial color="#c2ad82" roughness={1} transparent opacity={0.5} />
          </mesh>
        </group>
      ))}
      {/* plaza apron under the fountain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <circleGeometry args={[PLAZA_R - 3, 48]} />
        <meshStandardMaterial color="#d7c6a0" roughness={1} />
      </mesh>
    </group>
  )
}

function Fountain() {
  const water = useRef()
  const jet = useRef()
  useFrame((s) => {
    const t = s.clock.elapsedTime
    if (water.current) water.current.scale.y = 1 + Math.sin(t * 3) * 0.12
    if (jet.current) jet.current.scale.y = 1 + Math.sin(t * 3 + 1) * 0.25
  })
  if (hasModel('fountain')) return <Model modelKey="fountain" position={[0, 0, 0]} extraScale={1.7} />
  return (
    <group scale={1.7}>
      <mesh castShadow receiveShadow position={[0, 0.45, 0]}>
        <cylinderGeometry args={[2.7, 3, 0.9, 28]} />
        <meshStandardMaterial color="#d7cebc" roughness={0.9} flatShading />
      </mesh>
      <mesh castShadow position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.9, 1.1, 1.6, 16]} />
        <meshStandardMaterial color="#d7cebc" roughness={0.9} flatShading />
      </mesh>
      <mesh ref={water} position={[0, 0.8, 0]}>
        <cylinderGeometry args={[2.4, 2.4, 0.2, 28]} />
        <meshStandardMaterial color="#8fd6ff" roughness={0.12} metalness={0.15} transparent opacity={0.85} />
      </mesh>
      <mesh ref={jet} position={[0, 2.5, 0]}>
        <coneGeometry args={[0.4, 1.7, 12]} />
        <meshStandardMaterial color="#cdeeff" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

function Treehouse() {
  if (!hasModel('treehouse')) return null
  return (
    <Model modelKey="treehouse" position={[treehouse.x, 0, treehouse.z]} rotation-y={treehouse.rot} />
  )
}

function Fence() {
  const rail = '#eef0ea'
  return (
    <group>
      {fencePosts.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]} rotation={[0, p.rot, 0]}>
          <mesh position={[0, 0.62, 0]} castShadow>
            <boxGeometry args={[0.16, 1.24, 0.16]} />
            <meshStandardMaterial color={rail} roughness={1} flatShading />
          </mesh>
          <mesh position={[0, 1.34, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.14, 0.2, 4]} />
            <meshStandardMaterial color={rail} roughness={1} flatShading />
          </mesh>
        </group>
      ))}
      {/* two continuous rails, squashed on z to follow the oval ring */}
      {[0.45, 0.95].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.92, 1]}>
          <torusGeometry args={[FENCE_R, 0.06, 5, 180]} />
          <meshStandardMaterial color={rail} roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  )
}

export default function Island() {
  return (
    <group>
      <Ground />
      <Underside />
      <LoopRoad />
      <TrackDetails />
      <Footpaths />
      <Fence />
      <Fountain />
      <Treehouse />
    </group>
  )
}
