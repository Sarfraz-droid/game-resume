import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr } from '@react-three/drei'
import * as THREE from 'three'
import Scene from './Scene.jsx'

export default function Game() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.08
      }}
      camera={{ fov: 50, position: [0, 20, 46], near: 0.1, far: 600 }}
    >
      <color attach="background" args={['#eed0ae']} />
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
      <AdaptiveDpr pixelated />
    </Canvas>
  )
}
