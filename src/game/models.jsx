import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'

/**
 * Optional low-poly asset layer.
 *
 * Drop `.glb` files from https://poly.pizza/search/garden into
 * `src/assets/models/` using the file names below. Vite bundles whatever is
 * present; anything missing simply renders the built-in procedural mesh, so the
 * game always works with zero downloads.
 *
 * After adding a model you can nudge its fit here (`scale`, `y` lift off the
 * ground, `rotY` base rotation) without touching the scene code.
 */
export const MODELS = {
  treeRound: { file: 'tree-round.glb', scale: 1.0, y: 0, rotY: 0 },
  treePine: { file: 'tree-pine.glb', scale: 1.0, y: 0, rotY: 0 },
  treeBirch: { file: 'tree-birch.glb', scale: 1.0, y: 0, rotY: 0 },
  bush: { file: 'bush.glb', scale: 1.0, y: 0, rotY: 0 },
  rock: { file: 'rock.glb', scale: 1.0, y: 0, rotY: 0 },
  flowers: { file: 'flowers.glb', scale: 1.0, y: 0, rotY: 0 },
  bench: { file: 'bench.glb', scale: 1.0, y: 0, rotY: 0 },
  lamp: { file: 'lamp.glb', scale: 1.0, y: 0, rotY: 0 },
  bridge: { file: 'bridge.glb', scale: 1.0, y: 0, rotY: 0 },
  treehouse: { file: 'treehouse.glb', scale: 1.0, y: 0, rotY: 0 },
  fountain: { file: 'fountain.glb', scale: 1.0, y: 0, rotY: 0 },
  lilypad: { file: 'lilypad.glb', scale: 1.0, y: 0, rotY: 0 },
  sheep: { file: 'sheep.glb', scale: 1.0, y: 0, rotY: 0 },
  barrel: { file: 'barrel.glb', scale: 1.0, y: 0, rotY: 0 },
}

// Vite inlines this at build time. No matches => {} => everything falls back.
const URLS = import.meta.glob('../assets/models/*.glb', {
  eager: true,
  query: '?url',
  import: 'default',
})

function resolve(file) {
  const hit = Object.entries(URLS).find(([path]) => path.endsWith('/' + file))
  return hit ? hit[1] : null
}

/** True when the .glb for this key was found in src/assets/models/. */
export function hasModel(key) {
  const m = MODELS[key]
  return !!(m && resolve(m.file))
}

function GltfInstance({ url, extraScale = 1, extraY = 0, extraRotY = 0, cfg, ...props }) {
  const { scene } = useGLTF(url)
  const object = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })
    return c
  }, [scene])
  return (
    <primitive
      object={object}
      scale={cfg.scale * extraScale}
      rotation-y={cfg.rotY + extraRotY}
      position-y={cfg.y + extraY}
      {...props}
    />
  )
}

/**
 * Renders the poly.pizza model for `modelKey`, or `null` if the file is absent
 * (callers pair this with their procedural fallback).
 *
 * `extraScale` / `extraY` / `extraRotY` are per-instance tweaks on top of the
 * per-model config in MODELS.
 */
export function Model({ modelKey, extraScale, extraY, extraRotY, ...props }) {
  const cfg = MODELS[modelKey]
  const url = cfg && resolve(cfg.file)
  if (!url) return null
  return (
    <GltfInstance
      url={url}
      cfg={cfg}
      extraScale={extraScale}
      extraY={extraY}
      extraRotY={extraRotY}
      {...props}
    />
  )
}

// Warm the cache for whatever shipped.
for (const { file } of Object.values(MODELS)) {
  const url = resolve(file)
  if (url) useGLTF.preload(url)
}
