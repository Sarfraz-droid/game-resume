import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { trackPhysics } from './trackPhysics.js'
import { useStore } from '../state/store.js'

// A low checkpoint belongs to the landscape; résumé content lives in the
// proximity popup, not on another board competing with it.
export default function ZoneMarker({ stop }) {
  const root = useRef()
  const nearby = useStore(s => s.currentStop === stop.id)
  const visited = useStore(s => !!s.visited[stop.zone.key])
  const color = nearby ? '#e9ad72' : visited ? '#abc7a3' : '#e7ece1'
  useFrame(() => {
    const ground = trackPhysics.current?.sample(stop.pos[0], stop.pos[2])
    if (root.current && ground) root.current.position.y = ground.y + .03
  })
  return <group ref={root} name={`resume-checkpoint-${stop.id}`} position={stop.pos}
    onClick={event => { event.stopPropagation(); useStore.getState().browseStop(stop.zone.key, stop.pageIndex) }}>
    <mesh receiveShadow>
      <cylinderGeometry args={[.66, .72, .1, 40]} />
      <meshStandardMaterial color="#39473b" roughness={.85} />
    </mesh>
    <mesh position={[0, .065, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[.46, .56, 40]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={nearby ? .35 : .08} roughness={.6} />
    </mesh>
    <mesh position={[0, .13, 0]} castShadow>
      <sphereGeometry args={[.23, 20, 12]} />
      <meshStandardMaterial color={color} roughness={.45} />
    </mesh>
  </group>
}
