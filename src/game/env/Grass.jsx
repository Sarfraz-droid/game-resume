import { useMemo, useRef, useLayoutEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ISLAND_R, clear, rand } from '../layout.js'
import { createPackedGrassPatches } from '../grassLayout.js'
import { useStore, selectReducedMotion } from '../../state/store.js'
import { KitPart, hasKit } from '../kit.jsx'

const BLADE_H = 0.82
function PackedGrass() {
  const patches = useMemo(() => createPackedGrassPatches(clear), [])

  return (
    <group>
      {patches.map((patch, index) => (
        <group
          key={index}
          position={[patch.x, 0.04, patch.z]}
          rotation-y={patch.rotation}
          scale={[1, patch.heightScale, 1]}
        >
          <KitPart kit="grass" fit={patch.fit} fitWidth tone={patch.tone} />
        </group>
      ))}
    </group>
  )
}

/** one tapered blade, base at y=0 */
function bladeGeometry(h) {
  const g = new THREE.PlaneGeometry(0.09, h, 1, 4)
  g.translate(0, h / 2, 0)
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const taper = 1 - (p.getY(i) / h) * 0.85
    p.setX(i, p.getX(i) * taper)
  }
  g.computeVertexNormals()
  return g
}

function windMaterial(color) {
  const m = new THREE.MeshStandardMaterial({ color, roughness: 1, side: THREE.DoubleSide })
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 }
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\nuniform float uTime;\nvarying float vH;`)
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         vH = clamp(position.y / ${BLADE_H.toFixed(2)}, 0.0, 1.0);
         #ifdef USE_INSTANCING
           float ph = instanceMatrix[3].x * 0.6 + instanceMatrix[3].z * 0.6;
         #else
           float ph = 0.0;
         #endif
         float sway = sin(uTime * 1.7 + ph) * 0.15 + sin(uTime * 3.4 + ph * 1.7) * 0.05;
         float gust = sin(uTime * 0.45 + ph * 0.25) * 0.10;
         float b = (sway + gust) * vH * vH;
         transformed.x += b;
         transformed.z += cos(uTime * 1.25 + ph) * 0.05 * vH * vH;`
      )
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying float vH;`)
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
         diffuseColor.rgb *= mix(0.72, 1.1, vH);
         diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.64, 0.82, 0.40), vH * 0.5);`
      )
    m.userData.shader = shader
  }
  return m
}

function Field({ count, minScale, maxScale, seedShift, color }) {
  const ref = useRef()
  const geo = useMemo(() => bladeGeometry(BLADE_H), [])
  const mat = useMemo(() => windMaterial(color), [color])

  const items = useMemo(() => {
    const r = rand // shared deterministic stream is fine; offset by consuming
    for (let i = 0; i < seedShift; i++) r()
    const out = []
    let guard = 0
    while (out.length < count && guard++ < count * 30) {
      const a = r() * Math.PI * 2
      const rad = 2 + r() * (ISLAND_R - 3)
      const x = Math.cos(a) * rad
      const z = Math.sin(a) * rad * 0.9
      if (!clear(x, z, 0.4)) continue
      out.push([x, z, r() * Math.PI, minScale + r() * (maxScale - minScale), (r() - 0.5) * 0.25])
    }
    return out
  }, [count, minScale, maxScale, seedShift])

  useLayoutEffect(() => {
    const d = new THREE.Object3D()
    const c = new THREE.Color()
    items.forEach(([x, z, ry, s, lean], i) => {
      d.position.set(x, 0, z)
      d.rotation.set(lean, ry, lean * 0.6)
      d.scale.set(0.8 + Math.random() * 0.5, s, 1)
      d.updateMatrix()
      ref.current.setMatrixAt(i, d.matrix)
      const t = 0.82 + Math.random() * 0.3
      c.setRGB(color.r * t, color.g * t, color.b * t)
      ref.current.setColorAt(i, c)
    })
    ref.current.instanceMatrix.needsUpdate = true
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
  }, [items, color])

  useFrame((s) => {
    const sh = mat.userData.shader
    if (sh) sh.uniforms.uTime.value = selectReducedMotion(useStore.getState()) ? 0 : s.clock.elapsedTime
  })

  return <instancedMesh ref={ref} args={[geo, mat, items.length]} frustumCulled={false} receiveShadow />
}

export default function Grass() {
  if (hasKit('grass')) {
    return (
      <group>
        <PackedGrass />
      </group>
    )
  }
  return (
    <group>
      <Field count={30000} minScale={0.75} maxScale={1.3} seedShift={0} color={new THREE.Color('#63a03f')} />
      <Field count={9000} minScale={1.25} maxScale={2.0} seedShift={7} color={new THREE.Color('#71ac4a')} />
    </group>
  )
}
