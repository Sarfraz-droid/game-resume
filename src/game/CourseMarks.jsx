import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { labelTexture } from './textures.js'

function Sign({ track, x, z, heading, title, detail, color = '#ffd16a' }) {
  const texture = useMemo(() => labelTexture(title, detail), [title, detail])
  useEffect(() => () => texture.dispose(), [texture])
  const y = track.sample(x, z)?.y ?? 1.1
  return (
    <group position={[x, y, z]} rotation={[0, heading, 0]}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[0.08, 1.6, 0.08]} />
        <meshStandardMaterial color="#33424a" roughness={0.65} />
      </mesh>
      <mesh position={[0, 1.8, -0.015]} castShadow>
        <boxGeometry args={[2.6, 0.82, 0.035]} />
        <meshStandardMaterial color="#182a2d" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.8, 0.01]}>
        <planeGeometry args={[2.6, 0.82]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.27, 0]}>
        <boxGeometry args={[2.4, 0.06, 0.07]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
    </group>
  )
}

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
      <Sign track={track} x={3.6} z={18} heading={0} title="START / FINISH" detail="Follow the white arrows" color="#8df3d4" />
      <Sign track={track} x={3.5} z={-25} heading={0} title="BRAKE" detail="Hairpin ahead" />
      <Sign track={track} x={20} z={15.8} heading={Math.PI / 2} title="FULL THROTTLE" detail="Line up straight for the jump" color="#8df3d4" />
      <Sign track={track} x={8} z={15.8} heading={Math.PI / 2} title="JUMP →" detail="Keep accelerating · release drift" color="#8df3d4" />
      <Sign track={track} x={-25} z={15.8} heading={Math.PI / 2} title="BRAKE" detail="Turn right after landing" />
      <Sign track={track} x={-12.5} z={23} heading={Math.PI} title="HAIRPIN" detail="Brake · turn · accelerate" />
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
