import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Multi-object "kit" loader.
 *
 * Some low-poly packs ship a whole diorama in one .glb — a forest pack with 60
 * trees / mushrooms / stones, a Japanese garden with a bridge and lanterns.
 * `models.jsx` handles one-object files; this handles the packs: it loads the
 * pack once and lets the scene pull out a single named sub-object (or the whole
 * set), recentred on the origin with its base at y=0 and normalised to a target
 * size in world units so it drops straight into the garden.
 *
 * Drop the pack in `src/assets/models/` and it is picked up automatically; if a
 * pack is missing every caller falls back to its procedural mesh, so the game
 * always runs with zero downloads.
 */
export const KITS = {
  forest: 'forest-pack.glb', // Low Poly Forest Pack — trees, mushrooms, stones
  grass: 'grass-pack.glb', // Low Poly Grass Pack — three blade varieties
  garden: 'japanese-garden.glb', // Japanese Bridge Garden — bridge, lanterns
  kart: 'go-kart.glb', // Poly by Google — the playable vehicle
}

const KART_MATS = {
  '01___Default': { hex: '#e8663f' },
  '13___Default': { hex: '#262a31' },
  '07___Default': { hex: '#f4efe4' },
  '19___Default': { hex: '#101216' },
}

const GRASS_MATS = [
  {
    material: { hex: '#5f9f46' },
    material_1: { hex: '#91c153' },
    material_2: { hex: '#3c7540' },
  },
  {
    material: { hex: '#72ae4c' },
    material_1: { hex: '#a5ce62' },
    material_2: { hex: '#4d8443' },
  },
  {
    material: { hex: '#4d9148' },
    material_1: { hex: '#7db24e' },
    material_2: { hex: '#315f3d' },
  },
  {
    material: { hex: '#79b455' },
    material_1: { hex: '#b0cf68' },
    material_2: { hex: '#527c40' },
  },
]

/**
 * Named sub-objects worth pulling out of each pack.
 *
 * NOTE: three's GLTFLoader strips `.` `:` `[` `]` `/` from node names on import
 * (they're reserved for animation track paths), so `oak_Tree_Trunk.002` in the
 * file resolves as `oak_Tree_Trunk002`. Names here are already in that form;
 * `normalise()` also retries with dots stripped as a safety net.
 */
export const FOREST = {
  oak: 'oak_Tree_Trunk_1',
  oak2: 'oak_Tree_Trunk002_12',
  pine: 'pine_Tree_Trunk006_20',
  pine2: 'pine_Tree_Trunk008_24',
  spruce: 'Tree_Trunk009_26',
  birch: 'birch_Tree_Trunk012_32',
  birch2: 'birch_Tree_Trunk014_36',
  bushLight: 'light_bush002_55',
  bushDark: 'dark_bush006_66',
  stoneA: 'stone002_47',
  stoneB: 'mossed_stone006_51',
  stoneC: 'mossed_stone008_61',
  logA: 'pine_log_40',
  logB: 'birch_log002_52',
  stumpA: 'pine_stump_41',
  stumpB: 'oak_stump003_44',
  flyAgaric: 'fly_agaric_2',
  cep: 'ceps_7',
  chanterelle: 'chanterelle_38',
  honey: 'honey_mushroom_37',
  fernA: 'fern_5',
  fernB: 'fern002_4',
  dandelions: 'dandelion_flowers_64',
}

/**
 * The Japanese-garden pack colours its meshes through
 * KHR_materials_pbrSpecularGlossiness, which three r150+ no longer reads — every
 * material would otherwise load flat white. These are the pack's own
 * `diffuseFactor` values (linear RGB), re-applied by material name in
 * `normalise()`. `e` marks the lantern-flame material as emissive.
 */
export const GARDEN_MATS = {
  'Material.001': { rgb: [0.8, 0.8, 0.8] }, // paper / light stone
  'Material.002': { rgb: [0.044, 0.044, 0.044] }, // black iron
  'Material.003': { rgb: [0.8, 0.093, 0.08] }, // vermilion bridge
  'Material.004': { rgb: [1.0, 0.85, 0.22], e: 0.9 }, // lantern flame
  'Material.005': { rgb: [0.19, 0.508, 0.8] }, // pond water
  'Material.006': { rgb: [0.338, 0.458, 0.225] }, // moss
  'Material.007': { rgb: [0.08, 0.08, 0.08] }, // dark metal
  'Material.008': { rgb: [0.8, 0.407, 0.182] }, // warm wood
  'Material.009': { rgb: [0.8, 0.603, 0.266] }, // sand / gravel
  'Material.010': { rgb: [0.173, 0.111, 0.062] }, // dark wood
  'Material.011': { rgb: [0.41, 0.8, 0.377] }, // foliage
  'Material.012': { rgb: [0.8, 0.176, 0.79] }, // blossom
  'Material.016': { rgb: [0.119, 0.046, 0.018] }, // bark
}

const URLS = import.meta.glob('../assets/models/*.glb', {
  eager: true,
  query: '?url',
  import: 'default',
})

function urlFor(file) {
  const hit = Object.entries(URLS).find(([path]) => path.endsWith('/' + file))
  return hit ? hit[1] : null
}

/** True when the .glb for this kit key was found in src/assets/models/. */
export function hasKit(key) {
  return !!urlFor(KITS[key])
}

/**
 * Clone `node` (or the whole `scene` when `node` is null), bake in the pack's
 * root orientation, sit its base on y=0, centre it on x/z and scale it so its
 * height (or, with `fitWidth`, its footprint) is `fit` world units. Materials
 * are cloned and flat-shaded to match the rest of the low-poly garden.
 */
function normalise(scene, node, { fit = 3, fitWidth = false, recolor = null, castsShadow = true } = {}) {
  const src = node
    ? scene.getObjectByName(node) || scene.getObjectByName(node.replace(/\./g, ''))
    : scene
  if (!src) {
    console.warn(`[kit] node "${node}" not found in pack`)
    return null
  }

  const obj = src.clone(true)
  if (node && src.parent) {
    src.parent.updateWorldMatrix(true, false)
    obj.applyMatrix4(src.parent.matrixWorld)
  }
  obj.updateMatrixWorld(true)

  obj.traverse((o) => {
    if (!o.isMesh) return
    o.castShadow = castsShadow
    o.receiveShadow = true
    const mats = Array.isArray(o.material) ? o.material : [o.material]
    o.material = mats.map((m) => {
      const swatch = recolor && recolor[m.name]
      // Clone instead of rebuilding the material so GLB-authored render state
      // survives recolouring. Grass blades in particular require DoubleSide;
      // replacing their material with MeshStandardMaterial's FrontSide default
      // culls most of each clump and makes the pack look missing.
      const c = m.clone()
      if (swatch) {
        c.name = m.name
        c.roughness = 1
        c.metalness = 0
        if (swatch.hex) c.color.set(swatch.hex)
        else c.color.setRGB(...swatch.rgb, THREE.LinearSRGBColorSpace)
        if (swatch.e) {
          c.emissive.setRGB(...swatch.rgb, THREE.LinearSRGBColorSpace)
          c.emissiveIntensity = swatch.e
          c.toneMapped = false
        }
      }
      c.flatShading = true
      if (c.transparent || /trans/i.test(c.name)) {
        // alpha-tested leaves: crisp edges + solid shadows, no sort fighting
        c.alphaTest = 0.4
        c.transparent = false
        c.depthWrite = true
        c.side = THREE.DoubleSide
      }
      c.needsUpdate = true
      return c
    })
    if (o.material.length === 1) o.material = o.material[0]
  })

  const group = new THREE.Group()
  group.add(obj)

  const box = new THREE.Box3().setFromObject(obj)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  obj.position.x -= center.x
  obj.position.z -= center.z
  obj.position.y -= box.min.y

  const denom = fitWidth ? Math.max(size.x, size.z) : size.y
  if (denom > 1e-4) group.scale.setScalar(fit / denom)
  return group
}

/**
 * Render one sub-object from a pack, or `null` when the pack is absent (callers
 * pair this with their procedural fallback).
 *
 * - `kit`    key in KITS ('forest' | 'garden' | 'kart')
 * - `node`   node name inside that pack, or null for the whole set
 * - `fit`    target size in world units (height, or footprint with `fitWidth`)
 * - `extraScale` per-instance multiplier on top of `fit`
 */
// One normalised template per (kit, node, fit, fitWidth) — placements clone it,
// so geometry and materials are shared across every copy of a given prop.
const templates = new Map()
function getTemplate(kit, scene, node, opts) {
  const key = `${kit}|${node}|${opts.fit}|${opts.fitWidth}|${opts.castsShadow}|${opts.variant ?? ''}`
  if (!templates.has(key)) templates.set(key, normalise(scene, node, opts))
  return templates.get(key)
}

export function KitPart({ kit, node = null, fit = 3, fitWidth = false, extraScale = 1, tone = 0, ...props }) {
  const url = urlFor(KITS[kit])
  const { scene } = useGLTF(url || '')
  const object = useMemo(() => {
    if (!url) return null
    const grassTone = Math.abs(tone) % GRASS_MATS.length
    const recolor =
      kit === 'garden'
        ? GARDEN_MATS
        : kit === 'kart'
          ? KART_MATS
          : kit === 'grass'
            ? GRASS_MATS[grassTone]
            : null
    const template = getTemplate(kit, scene, node, {
      fit,
      fitWidth,
      recolor,
      castsShadow: kit !== 'grass',
      variant: kit === 'grass' ? grassTone : '',
    })
    if (!template) return null
    const clone = template.clone(true)
    clone.scale.multiplyScalar(extraScale)
    return clone
  }, [kit, scene, url, node, fit, fitWidth, extraScale, tone])
  if (!object) return null
  return <primitive object={object} {...props} />
}

// Warm the cache for whatever packs shipped.
for (const file of Object.values(KITS)) {
  const url = urlFor(file)
  if (url) useGLTF.preload(url)
}
