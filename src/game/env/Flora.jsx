import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { flowers, mushrooms, pebbles, ponds, bushes, rand } from '../layout.js'
import { KitPart, hasKit, FOREST } from '../kit.jsx'

const FOREST_SHROOM = [FOREST.flyAgaric, FOREST.cep, FOREST.chanterelle, FOREST.honey]
const FOREST_FERN = [FOREST.fernA, FOREST.fernB]

const FLOWER_COLORS = ['#ffffff', '#ff8fb1', '#ffd24a', '#c7a3ff', '#ff7043'].map((c) => new THREE.Color(c))

function useInstances(ref, items, place) {
  useLayoutEffect(() => {
    const d = new THREE.Object3D()
    items.forEach((it, i) => {
      place(d, it, i)
      d.updateMatrix()
      ref.current.setMatrixAt(i, d.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  }, [items])
}

function Flowers() {
  const stems = useRef()
  const heads = useRef()
  useInstances(stems, flowers, (d, f) => {
    d.position.set(f.x, 0.32 * f.s, f.z)
    d.rotation.set(0, f.rot, 0)
    d.scale.setScalar(f.s)
  })
  useLayoutEffect(() => {
    const d = new THREE.Object3D()
    flowers.forEach((f, i) => {
      d.position.set(f.x, 0.68 * f.s, f.z)
      d.rotation.set(0, f.rot, 0)
      d.scale.setScalar(f.s)
      d.updateMatrix()
      heads.current.setMatrixAt(i, d.matrix)
      heads.current.setColorAt(i, FLOWER_COLORS[f.c])
    })
    heads.current.instanceMatrix.needsUpdate = true
    if (heads.current.instanceColor) heads.current.instanceColor.needsUpdate = true
  }, [])
  return (
    <group>
      <instancedMesh ref={stems} args={[undefined, undefined, flowers.length]} frustumCulled={false}>
        <cylinderGeometry args={[0.03, 0.045, 0.68, 4]} />
        <meshStandardMaterial color="#5c9b48" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, flowers.length]} frustumCulled={false}>
        <icosahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial roughness={0.7} flatShading />
      </instancedMesh>
    </group>
  )
}

function Mushrooms() {
  const stems = useRef()
  const caps = useRef()
  useInstances(stems, mushrooms, (d, m) => {
    d.position.set(m.x, 0.12 * m.s, m.z)
    d.scale.setScalar(m.s)
  })
  useInstances(caps, mushrooms, (d, m) => {
    d.position.set(m.x, 0.26 * m.s, m.z)
    d.scale.setScalar(m.s)
  })
  return (
    <group>
      <instancedMesh ref={stems} args={[undefined, undefined, mushrooms.length]} frustumCulled={false}>
        <cylinderGeometry args={[0.06, 0.08, 0.26, 6]} />
        <meshStandardMaterial color="#efe7d6" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={caps} args={[undefined, undefined, mushrooms.length]} frustumCulled={false}>
        <sphereGeometry args={[0.17, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#d1503f" roughness={0.8} flatShading />
      </instancedMesh>
    </group>
  )
}

// forest-pack groundcover: real low-poly toadstools where the procedural
// caps used to be, plus a few ferns tucked into the shrub border
function ForestGroundcover() {
  return (
    <group>
      {mushrooms.map((m, i) => (
        <KitPart
          key={`m${i}`}
          kit="forest"
          node={FOREST_SHROOM[i % FOREST_SHROOM.length]}
          fit={0.34 + (i % 3) * 0.06}
          extraScale={m.s}
          position={[m.x, 0, m.z]}
          rotation-y={m.rot ?? i}
        />
      ))}
      {bushes.map((b, i) =>
        i % 6 === 0 ? (
          <KitPart
            key={`f${i}`}
            kit="forest"
            node={FOREST_FERN[i % FOREST_FERN.length]}
            fit={0.7}
            fitWidth
            extraScale={(0.8 + (i % 3) * 0.15) / b.s}
            position={[b.x + 1.3, 0, b.z - 1.1]}
            rotation-y={b.rot * 1.7}
          />
        ) : null
      )}
    </group>
  )
}

function Pebbles() {
  const ref = useRef()
  useInstances(ref, pebbles, (d, p) => {
    d.position.set(p.x, 0.04, p.z)
    d.rotation.set(p.rot, p.rot * 2, p.rot)
    d.scale.set(0.12 + p.s * 0.14, 0.08 + p.s * 0.08, 0.12 + p.s * 0.14)
  })
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, pebbles.length]} receiveShadow frustumCulled={false}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#9a958c" roughness={1} flatShading />
    </instancedMesh>
  )
}

function PondLife() {
  const reeds = useMemo(() => {
    const out = []
    ponds.forEach((p) => {
      const n = 44
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + rand() * 0.3
        const rr = p.r + 0.4 + rand() * 1.4
        out.push([p.x + Math.cos(a) * rr, p.z + Math.sin(a) * rr, 0.8 + rand() * 0.9, rand() * Math.PI])
      }
    })
    return out
  }, [])
  const reedRef = useRef()
  useLayoutEffect(() => {
    const d = new THREE.Object3D()
    reeds.forEach(([x, z, s, r], i) => {
      d.position.set(x, s * 0.5, z)
      d.rotation.set(0.08, r, 0.08)
      d.scale.set(1, s, 1)
      d.updateMatrix()
      reedRef.current.setMatrixAt(i, d.matrix)
    })
    reedRef.current.instanceMatrix.needsUpdate = true
  }, [reeds])

  return (
    <group>
      <instancedMesh ref={reedRef} args={[undefined, undefined, reeds.length]} frustumCulled={false}>
        <cylinderGeometry args={[0.03, 0.05, 1, 4]} />
        <meshStandardMaterial color="#7fae52" roughness={1} />
      </instancedMesh>
      {ponds.flatMap((p, pi) =>
        Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2
          const rr = rand() * (p.r - 1.5)
          return (
            <mesh
              key={`${pi}-${i}`}
              position={[p.x + Math.cos(a) * rr, 0.14, p.z + Math.sin(a) * rr]}
              rotation={[-Math.PI / 2, 0, a]}
            >
              <circleGeometry args={[0.5 + rand() * 0.3, 7]} />
              <meshStandardMaterial color="#4e9d54" roughness={0.8} flatShading side={THREE.DoubleSide} />
            </mesh>
          )
        })
      )}
    </group>
  )
}

export default function Flora() {
  return (
    <group>
      <Flowers />
      {hasKit('forest') ? <ForestGroundcover /> : <Mushrooms />}
      <Pebbles />
      <PondLife />
    </group>
  )
}
