import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { buildTrackPhysics, trackPhysics, TRACK_SCALE } from './trackPhysics.js'
import { zoneLayout } from './layout.js'
import * as THREE from 'three'
import CourseMarks from './CourseMarks.jsx'
import trackUrl from '../../map/low_poly_race_track.glb?url'

// The source scene includes a handful of parked cars and tyre piles. They make
// the course read like a prop showroom and compete with the résumé checkpoints,
// so keep the course and its landscape but remove that incidental dressing.
const JUNK = /^(car|police car|wheel|bunch of wheels|stack of wheels|big wheel)/i

export default function RaceTrack() {
  const { scene } = useGLTF(trackUrl)
  const course = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((object) => {
      if (JUNK.test(object.name)) object.visible = false
      if (object.isMesh) {
        object.castShadow = true
        object.receiveShadow = true
      }
    })
    clone.scale.setScalar(TRACK_SCALE)
    clone.updateMatrixWorld(true)
    clone.traverse(object => {
      if (!/^forest/i.test(object.name)) return
      const center = new THREE.Box3().setFromObject(object).getCenter(new THREE.Vector3())
      if (zoneLayout.some(zone => Math.hypot(center.x - zone.pos[0], center.z - zone.pos[2]) < 2.2)) object.visible = false
    })
    return clone
  }, [scene])

  const data = useMemo(() => buildTrackPhysics(course), [course])
  useEffect(() => {
    trackPhysics.current = data
    return () => { if (trackPhysics.current === data) trackPhysics.current = null }
  }, [data])

  return <group><primitive object={course} /><CourseMarks track={data} /></group>
}

useGLTF.preload(trackUrl)
