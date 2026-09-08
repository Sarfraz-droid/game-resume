import { useAtmosphere } from './Atmosphere.jsx'
import { Environment, Lightformer } from '@react-three/drei'

export default function Lighting() {
  const sky = useAtmosphere()
  return (
    <>
      <hemisphereLight args={[sky.key, sky.ground, sky.hemisphere]} />
      <ambientLight intensity={sky.ambient} />

      {/* warm low key light — long soft shadows */}
      <directionalLight
        castShadow
        position={[76, 54, -38]}
        intensity={sky.keyIntensity}
        color={sky.key}
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
      <directionalLight position={[-40, 26, 34]} intensity={.38 - sky.night * .22} color={sky.fill} />

      {/* in-engine studio reflections (no external HDRI) */}
      <Environment key={sky.reflection} resolution={128} frames={1}>
        <color attach="background" args={[sky.ground]} />
        <Lightformer intensity={2.6 * sky.reflection} position={[6, 8, 4]} scale={[14, 14, 1]} color="#fff0d6" />
        <Lightformer intensity={1.2 * sky.reflection} position={[-8, 5, -6]} scale={[9, 9, 1]} color="#e3c7ad" />
        <Lightformer intensity={.9 * sky.reflection} position={[8, 2, -8]} scale={[7, 7, 1]} color="#ffcfa0" />
        <Lightformer intensity={.6 * sky.reflection} form="ring" position={[0, 10, 0]} scale={12} color="#ffe9c8" />
      </Environment>
    </>
  )
}
