import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { carState } from './layout.js'
import { useStore, selectReducedMotion } from '../state/store.js'

const COUNT = 320
const transform = new THREE.Object3D()

export default function SkidMarks() {
  const mesh = useRef()
  const previous = useRef(null)
  const cursor = useRef(0)
  useFrame(() => {
    const game = useStore.getState()
    if (!mesh.current || game.phase !== 'playing' || game.panel || game.menuOpen || selectReducedMotion(game) || !carState.drifting) {
      previous.current = null
      return
    }
    const { x, y, z, heading } = carState
    const points = [-0.46, 0.46].map(side => ({
      x: x - Math.sin(heading) * 0.525 + Math.cos(heading) * side,
      z: z - Math.cos(heading) * 0.525 - Math.sin(heading) * side,
      y,
    }))
    if (previous.current) {
      const distance = Math.hypot(points[0].x - previous.current[0].x, points[0].z - previous.current[0].z)
      if (distance < 0.12) return
      if (distance < 1.2) points.forEach((point, i) => {
        const last = previous.current[i]
        const length = Math.hypot(point.x - last.x, point.z - last.z)
        transform.position.set((point.x + last.x) / 2, Math.max(point.y, last.y) + 0.028, (point.z + last.z) / 2)
        transform.rotation.set(-Math.PI / 2, 0, Math.atan2(point.x - last.x, point.z - last.z))
        transform.scale.set(0.14, length + 0.04, 1)
        transform.updateMatrix()
        mesh.current.setMatrixAt(cursor.current++ % COUNT, transform.matrix)
        mesh.current.count = Math.min(cursor.current, COUNT)
        mesh.current.instanceMatrix.needsUpdate = true
      })
    }
    previous.current = points
  })
  return (
    <instancedMesh ref={mesh} args={[null, null, COUNT]} count={0} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="#182021" transparent opacity={0.28} depthWrite={false} polygonOffset polygonOffsetFactor={-1} />
    </instancedMesh>
  )
}
