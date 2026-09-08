import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

function Arrow({ track, x, z, heading, color }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-0.55, 0.45)
    shape.lineTo(0, -0.2)
    shape.lineTo(0.55, 0.45)
    shape.lineTo(0.55, 0.12)
    shape.lineTo(0, -0.55)
    shape.lineTo(-0.55, 0.12)
    shape.closePath()
    return new THREE.ShapeGeometry(shape)
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])
  const y = track.sample(x, z)?.y ?? 1.1
  return (
    <group position={[x, y + 0.025, z]} rotation={[0, heading, 0]}>
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color={color} transparent opacity={0.85} polygonOffset polygonOffsetFactor={-2} depthWrite={false} />
      </mesh>
    </group>
  )
}

export default function CourseMarks({ track }) {
  return (
    <group name="course-driving-markers">
      {[20, 15, 10, 4, -23, -27].map(z => <Arrow key={`start-${z}`} track={track} x={0.15} z={z} heading={Math.PI} color="#f5efe0" />)}
      {[18, 15.5, 13, 10.5, 8].map(x => <Arrow key={`jump-${x}`} track={track} x={x} z={11.5} heading={-Math.PI / 2} color="#8df3d4" />)}
      {[10, 16, 22].map(z => <Arrow key={`return-${z}`} track={track} x={-8.95} z={z} heading={0} color="#f5efe0" />)}
      {[8, 10, 12, 14, 16, 18].flatMap(x => [8.9, 14.1].map(z => (
        <mesh key={`${x}-${z}`} position={[x, (track.sample(x, z)?.y ?? 1.1) + 0.07, z]}>
          <boxGeometry args={[0.5, 0.08, 0.12]} />
          <meshStandardMaterial color="#8df3d4" emissive="#8df3d4" emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      )))}
    </group>
  )
}
