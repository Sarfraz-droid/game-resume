import fs from 'node:fs/promises'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { buildTrackPhysics, TRACK_SCALE } from '../../src/game/trackPhysics.js'

export async function loadTrack() {
  const data = await fs.readFile(new URL('../../map/low_poly_race_track.glb', import.meta.url))
  const length = data.readUInt32LE(12)
  const json = JSON.parse(data.subarray(20, 20 + length))
  // Geometry-only load in Node; the original transforms and buffers are intact.
  json.images = []; json.textures = []; json.materials = []
  for (const mesh of json.meshes) for (const primitive of mesh.primitives) delete primitive.material
  json.buffers[0].uri = 'data:application/octet-stream;base64,' + data.subarray(28 + length).toString('base64')
  globalThis.ProgressEvent ??= class ProgressEvent {}
  const { scene } = await new GLTFLoader().parseAsync(JSON.stringify(json), '')
  scene.scale.setScalar(TRACK_SCALE)
  return buildTrackPhysics(scene)
}
