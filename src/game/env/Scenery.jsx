import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { trees, rocks, bushes, lamps, benches, sheep, logs } from '../layout.js'
import { useStore, selectReducedMotion } from '../../state/store.js'
import { Model, hasModel } from '../models.jsx'
import { KitPart, hasKit, FOREST } from '../kit.jsx'

const TREE_KEY = ['treeRound', 'treePine', 'treeBirch']

// forest-pack species per tree kind (0 round · 1 conifer · 2 birch), two
// variants each so a ring of trees doesn't read as one cloned mesh
const FOREST_TREE = [
  [FOREST.oak, FOREST.oak2],
  [FOREST.pine, FOREST.pine2, FOREST.spruce],
  [FOREST.birch, FOREST.birch2],
]
const FOREST_BUSH = [FOREST.bushLight, FOREST.bushDark]
const FOREST_STONE = [FOREST.stoneA, FOREST.stoneB, FOREST.stoneC]
const FOREST_LOG = [FOREST.logA, FOREST.logB, FOREST.stumpA, FOREST.stumpB]

const ROUND = ['#5f9e46', '#6faa4e', '#7cb85a', '#568f3f']
const PINE = ['#3f6b45', '#48784d', '#3a6350']
const ROCK = ['#9a958c', '#8c8880', '#a6a199']
const BARK = '#8a6238'

function RoundTree({ t }) {
  return (
    <>
      <mesh castShadow position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.16, 0.26, 1.7, 6]} />
        <meshStandardMaterial color={BARK} roughness={1} flatShading />
      </mesh>
      <mesh castShadow position={[0, 2.1, 0]}>
        <icosahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial color={ROUND[t.tint]} roughness={1} flatShading />
      </mesh>
      <mesh castShadow position={[0.4, 2.9, 0.15]} scale={0.6}>
        <icosahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial color={ROUND[(t.tint + 1) % 4]} roughness={1} flatShading />
      </mesh>
      <mesh castShadow position={[-0.35, 2.6, -0.2]} scale={0.5}>
        <icosahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial color={ROUND[(t.tint + 2) % 4]} roughness={1} flatShading />
      </mesh>
    </>
  )
}

function Conifer({ t }) {
  const c = PINE[t.tint % 3]
  return (
    <>
      <mesh castShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.14, 0.2, 1, 6]} />
        <meshStandardMaterial color={BARK} roughness={1} flatShading />
      </mesh>
      {[
        [1.4, 1.8, 1.5],
        [2.5, 1.4, 1.2],
        [3.4, 1.0, 1.0],
      ].map(([y, r, h], i) => (
        <mesh key={i} castShadow position={[0, y, 0]}>
          <coneGeometry args={[r, h, 7]} />
          <meshStandardMaterial color={c} roughness={1} flatShading />
        </mesh>
      ))}
    </>
  )
}

function Birch({ t }) {
  return (
    <group rotation={[0.05, 0, 0.06]}>
      <mesh castShadow position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 3, 6]} />
        <meshStandardMaterial color="#e9e6dc" roughness={1} flatShading />
      </mesh>
      <mesh castShadow position={[0, 3.1, 0]}>
        <icosahedronGeometry args={[0.95, 0]} />
        <meshStandardMaterial color="#9ccb62" roughness={1} flatShading />
      </mesh>
      <mesh castShadow position={[0.3, 3.6, 0.1]} scale={0.55}>
        <icosahedronGeometry args={[0.95, 0]} />
        <meshStandardMaterial color="#acd873" roughness={1} flatShading />
      </mesh>
    </group>
  )
}

function Bench({ b }) {
  if (hasModel('bench')) {
    return <Model modelKey="bench" position={[b.x, 0, b.z]} rotation-y={b.rot} extraScale={2} />
  }
  const slat = '#b07b45'
  const leg = '#5f4326'
  return (
    <group position={[b.x, 0, b.z]} rotation={[0, b.rot, 0]} scale={2}>
      {/* seat slats */}
      {[-0.18, 0, 0.18].map((z) => (
        <mesh key={z} position={[0, 0.46, z]} castShadow receiveShadow>
          <boxGeometry args={[2.1, 0.09, 0.14]} />
          <meshStandardMaterial color={slat} roughness={1} flatShading />
        </mesh>
      ))}
      {/* back slats */}
      {[0.62, 0.82, 1.02].map((y) => (
        <mesh key={y} position={[0, y, -0.28]} rotation={[-0.18, 0, 0]} castShadow>
          <boxGeometry args={[2.1, 0.12, 0.09]} />
          <meshStandardMaterial color={slat} roughness={1} flatShading />
        </mesh>
      ))}
      {/* legs */}
      {[-0.9, 0.9].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.23, 0.16]} castShadow>
            <boxGeometry args={[0.12, 0.46, 0.12]} />
            <meshStandardMaterial color={leg} roughness={1} />
          </mesh>
          <mesh position={[x, 0.23, -0.2]} castShadow>
            <boxGeometry args={[0.12, 0.46, 0.12]} />
            <meshStandardMaterial color={leg} roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Sheep({ s }) {
  if (!hasModel('sheep')) return null
  return <Model modelKey="sheep" position={[s.x, 0, s.z]} rotation-y={s.rot} />
}

function Lamp({ l }) {
  if (hasModel('lamp')) {
    return (
      <group position={[l.x, 0, l.z]} rotation={[0, l.rot, 0]}>
        <Model modelKey="lamp" extraScale={1.6} />
        <pointLight position={[0, 4.6, 0]} color="#ffd98a" distance={12} intensity={0.5} />
      </group>
    )
  }
  return (
    <group position={[l.x, 0, l.z]} rotation={[0, l.rot, 0]} scale={1.6}>
      <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.28, 0.34, 0.3, 8]} />
        <meshStandardMaterial color="#2c3038" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh castShadow position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.08, 0.11, 3, 8]} />
        <meshStandardMaterial color="#33373f" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, 3.2, 0]}>
        <boxGeometry args={[0.42, 0.5, 0.42]} />
        <meshStandardMaterial color="#2c3038" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, 3.2, 0]}>
        <boxGeometry args={[0.3, 0.34, 0.3]} />
        <meshStandardMaterial color="#fff2c4" emissive="#ffcf6b" emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
      <mesh position={[0, 3.5, 0]}>
        <coneGeometry args={[0.3, 0.24, 4]} />
        <meshStandardMaterial color="#2c3038" roughness={0.6} />
      </mesh>
      <pointLight position={[0, 3.2, 0]} color="#ffd98a" distance={11} intensity={0.6} />
    </group>
  )
}

export default function Scenery() {
  const canopies = useRef([])

  useFrame((s) => {
    if (selectReducedMotion(useStore.getState())) return
    const t = s.clock.elapsedTime
    for (let i = 0; i < canopies.current.length; i++) {
      const g = canopies.current[i]
      if (g) g.rotation.z = Math.sin(t * 1.05 + i * 0.7) * 0.028
    }
  })

  const forest = hasKit('forest')

  return (
    <group>
      {trees.map((t, i) => {
        const key = TREE_KEY[t.kind] ?? 'treeRound'
        const species = FOREST_TREE[t.kind] ?? FOREST_TREE[0]
        return (
          <group
            key={i}
            position={[t.x, 0, t.z]}
            rotation={[0, t.rot, 0]}
            scale={t.s}
            ref={(el) => (canopies.current[i] = el)}
          >
            {forest ? (
              // forest-pack canopies are broad, so keep them modest and
              // cancel out the per-instance t.s (tuned for the slim
              // procedural trees) — final height ≈ 4–5 world units
              <KitPart
                kit="forest"
                node={species[i % species.length]}
                fit={2.7}
                extraScale={(1.3 + (i % 3) * 0.13) / t.s}
              />
            ) : hasModel(key) ? (
              <Model modelKey={key} />
            ) : t.kind === 1 ? (
              <Conifer t={t} />
            ) : t.kind === 2 ? (
              <Birch t={t} />
            ) : (
              <RoundTree t={t} />
            )}
          </group>
        )
      })}

      {rocks.map((r, i) =>
        forest ? (
          <KitPart
            key={i}
            kit="forest"
            node={FOREST_STONE[i % FOREST_STONE.length]}
            fit={1.0}
            fitWidth
            extraScale={(0.9 + (i % 3) * 0.25) / r.s}
            position={[r.x, 0, r.z]}
            rotation-y={r.rot}
          />
        ) : hasModel('rock') ? (
          <Model
            key={i}
            modelKey="rock"
            position={[r.x, 0, r.z]}
            rotation-y={r.rot}
            extraScale={r.s}
          />
        ) : (
          <mesh
            key={i}
            position={[r.x, 0.2 * r.s, r.z]}
            rotation={[r.rot, r.rot * 2, 0]}
            scale={r.s}
            castShadow
            receiveShadow
          >
            <dodecahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial color={ROCK[r.tint % 3]} roughness={1} flatShading />
          </mesh>
        )
      )}

      {bushes.map((b, i) =>
        forest ? (
          <KitPart
            key={i}
            kit="forest"
            node={FOREST_BUSH[i % FOREST_BUSH.length]}
            fit={1.1}
            fitWidth
            extraScale={(0.85 + (i % 3) * 0.2) / b.s}
            position={[b.x, 0, b.z]}
            rotation-y={b.rot}
          />
        ) : hasModel('bush') ? (
          <Model
            key={i}
            modelKey="bush"
            position={[b.x, 0, b.z]}
            rotation-y={b.rot}
            extraScale={b.s}
          />
        ) : (
          <mesh
            key={i}
            position={[b.x, 0.28, b.z]}
            scale={[b.s * 0.8, b.s * 0.55, b.s * 0.8]}
            castShadow
          >
            <icosahedronGeometry args={[0.75, 0]} />
            <meshStandardMaterial color={ROUND[(b.tint + 2) % 4]} roughness={1} flatShading />
          </mesh>
        )
      )}

      {forest &&
        logs.map((l, i) => (
          <KitPart
            key={i}
            kit="forest"
            node={FOREST_LOG[i % FOREST_LOG.length]}
            fit={1.0}
            fitWidth
            extraScale={(0.9 + (i % 2) * 0.3) / l.s}
            position={[l.x, 0, l.z]}
            rotation-y={l.rot}
          />
        ))}

      {lamps.map((l, i) => (
        <Lamp key={i} l={l} />
      ))}

      {benches.map((b, i) => (
        <Bench key={i} b={b} />
      ))}

      {sheep.map((s, i) => (
        <Sheep key={i} s={s} />
      ))}
    </group>
  )
}
