import { EffectComposer, Bloom, Vignette, SMAA } from '@react-three/postprocessing'
import { useStore, selectReducedMotion } from '../state/store.js'

const isMobile =
  typeof window !== 'undefined' && window.matchMedia?.('(pointer:coarse)').matches

export default function Effects() {
  const reduced = useStore(selectReducedMotion)
  if (reduced || isMobile) return null
  return (
    <EffectComposer multisampling={0}>
      <SMAA />
      <Bloom mipmapBlur intensity={0.55} luminanceThreshold={0.86} luminanceSmoothing={0.22} radius={0.7} />
      <Vignette eskil={false} offset={0.28} darkness={0.5} />
    </EffectComposer>
  )
}
