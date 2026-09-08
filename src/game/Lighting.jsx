import { Environment, Lightformer } from '@react-three/drei'

export default function Lighting() {
  return (
    <>
      <hemisphereLight args={['#ffe1b1', '#70503c', 0.64]} />
      <ambientLight intensity={0.12} />

      {/* warm low key light — long soft shadows */}
      <directionalLight
        castShadow
        position={[76, 54, -38]}
        intensity={1.55}
        color="#ffd29b"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-78}
        shadow-camera-right={78}
        shadow-camera-top={78}
        shadow-camera-bottom={-78}
        shadow-camera-near={1}
        shadow-camera-far={240}
      />
      {/* soft amber sky fill from the opposite side */}
      <directionalLight position={[-40, 26, 34]} intensity={0.38} color="#e3c7ad" />

      {/* in-engine studio reflections (no external HDRI) */}
      <Environment resolution={128} frames={1}>
        <color attach="background" args={['#32271f']} />
        <Lightformer intensity={2.6} position={[6, 8, 4]} scale={[14, 14, 1]} color="#fff0d6" />
        <Lightformer intensity={1.2} position={[-8, 5, -6]} scale={[9, 9, 1]} color="#e3c7ad" />
        <Lightformer intensity={0.9} position={[8, 2, -8]} scale={[7, 7, 1]} color="#ffcfa0" />
        <Lightformer intensity={0.6} form="ring" position={[0, 10, 0]} scale={12} color="#ffe9c8" />
      </Environment>
    </>
  )
}
