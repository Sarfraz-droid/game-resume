import { EffectComposer, Bloom, Vignette, SMAA, ToneMapping, BrightnessContrast, HueSaturation } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { useStore, selectReducedMotion } from '../state/store.js'

const isMobile = typeof window !== 'undefined' && window.matchMedia?.('(pointer:coarse)').matches

export default function Effects() {
  const reduced = useStore(selectReducedMotion)
  // Static grading stays available with reduced motion and on touch devices.
  // Bloom is reserved for desktop GPUs.
  const detailed = !isMobile
  return (
    <EffectComposer multisampling={0}>
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <BrightnessContrast brightness={0.015} contrast={0.09} />
      <HueSaturation saturation={0.025} />
      {detailed && <Bloom mipmapBlur intensity={reduced ? 0.2 : 0.38} luminanceThreshold={1.05} luminanceSmoothing={0.35} radius={0.6} />}
      <Vignette eskil={false} offset={0.3} darkness={0.24} />
      <SMAA />
    </EffectComposer>
  )
}
