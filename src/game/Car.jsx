import { useAtmosphere } from './Atmosphere.jsx'
import { selectVisibleStop, worldCardFrame } from './worldCard.js'
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { advanceVehicle, createVehicle, VEHICLE } from './vehiclePhysics.js'
import { trackPhysics, TRACK_SURFACE_Y } from './trackPhysics.js'
import { zoneLayout, carState, CAR_SPAWN } from './layout.js'
import { createDrivingAssist, drivingControls } from './drivingAssist.js'
import { nearestExhibitStop } from './exhibitStops.js'
import { readInput } from './input.js'
import { useStore, selectReducedMotion, selectReadingPause } from '../state/store.js'
import { updateEngine } from '../lib/sound.js'

// ---- tuning ---------------------------------------------------------------
const MAX_FWD = VEHICLE.maxForward
const CAM_FOV = 50
const CAM_BACK = 11
const CAM_HEIGHT = 7.4
const KART_SCALE = 0.5
// ------------------------------------------------------------------------

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const damp = (cur, goal, lambda, dt) => THREE.MathUtils.damp(cur, goal, lambda, dt)
const _fwd = new THREE.Vector3()
const _goal = new THREE.Vector3()
const _look = new THREE.Vector3()
const _tmp = new THREE.Vector3()

function Wheel({ position, front, rollRef, steerRef }) {
  const w = (
    <group ref={rollRef}>
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.44, 0.44, 0.36, 18]} />
        <meshStandardMaterial color="#2c2f38" roughness={0.85} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.19, 0.19, 0.38, 10]} />
        <meshStandardMaterial color="#e8e5dd" roughness={0.4} metalness={0.1} />
      </mesh>
    </group>
  )
  return <group position={position}>{front ? <group ref={steerRef}>{w}</group> : w}</group>
}

export default function Car() {
  const atmosphere = useAtmosphere()
  const camera = useThree((s) => s.camera)
  const car = useRef()
  const shell = useRef()
  const fl = useRef(), fr = useRef(), rl = useRef(), rr = useRef()
  const sfl = useRef(), sfr = useRef()
  const ant = useRef()
  const beamL = useRef(), beamR = useRef()
  const driver = useRef(createDrivingAssist())
  const physics = useRef(createVehicle(CAR_SPAWN))
  // The bundled kart asset was authored with a below-ground origin. The
  // procedural kart has a stable wheel-to-road contact point on this level.
  const realKart = false

  const s = useRef({
    x: CAR_SPAWN.x, y: TRACK_SURFACE_Y, z: CAR_SPAWN.z, heading: CAR_SPAWN.heading, speed: 0,
    lean: 0, pitch: 0, steer: 0, wheel: 0, camReady: 0, idle: 0, orbit: 0,
  }).current

  useFrame(({ size }, dRaw) => {
    const dt = Math.min(dRaw, 0.05)
    const t = performance.now() / 1000
    const st = useStore.getState()
    const reduced = selectReducedMotion(st)

    // ---------- intro orbit on the start screen ----------
    if (st.phase !== 'playing' && !st.exhibitFocus) {
      s.orbit += dt * (reduced ? 0 : 0.12)
      const r = 84
      camera.position.set(Math.cos(s.orbit) * r, 52, Math.sin(s.orbit) * r)
      camera.lookAt(0, 0, 0)
      if (camera.fov !== CAM_FOV) {
        camera.fov = CAM_FOV
        camera.updateProjectionMatrix()
      }
      return
    }

    const frozen = !!st.panel || st.menuOpen || st.plain || !!st.exhibitFocus
    const controls = frozen ? { thr: 0, str: 0 } : readInput()
    const { thr, str } = controls
    if (st.autopilot && (controls.thr || controls.str || controls.drift || controls.reset)) st.setAutopilot(false)
    const automatic = useStore.getState().autopilot
    const reading = selectReadingPause(useStore.getState())
    const prev = s.speed
    const sim = advanceVehicle(physics.current, controls, dRaw, trackPhysics.current, CAR_SPAWN, frozen || reading,
      (vehicle, input, step, track) => drivingControls(vehicle, input, step, track, driver.current, automatic, st.driveAssist))
    s.x = sim.x
    s.y = sim.y
    s.z = sim.z
    s.speed = sim.speed
    s.heading = sim.heading
    s.steer = sim.steer
    const speedRatio = clamp(Math.hypot(sim.vx, sim.vz) / MAX_FWD, 0, 1)
    // ---------- body juice ----------
    const accel = (s.speed - prev) / Math.max(dt, 0.001)
    const speedN = speedRatio
    const jLean = reduced ? 0 : -s.steer * clamp(speedN, 0, 1) * 0.14
    const accelPitch = reduced ? 0 : clamp(-accel * 0.006, -0.13, 0.13)
    s.lean = damp(s.lean, jLean, 9, dt)
    s.pitch = damp(s.pitch, reduced ? 0 : accelPitch, 8, dt)
    car.current.position.set(s.x, s.y, s.z)
    car.current.rotation.set(sim.pitch, s.heading, sim.roll, 'YXZ')
    if (shell.current) {
      shell.current.rotation.set(s.pitch, 0, s.lean)
      shell.current.position.y = (realKart ? 0.05 : 0.62) + (reduced ? 0 : Math.sin(t * 3.1) * 0.01)
    }

    s.wheel = sim.wheel
    for (const w of [fl, fr, rl, rr]) if (w.current) w.current.rotation.x = s.wheel
    for (const w of [sfl, sfr]) if (w.current) w.current.rotation.y = s.steer * (0.48 / (1 + Math.abs(s.speed) * 0.09))
    if (ant.current) {
      ant.current.rotation.x = (reduced ? 0 : Math.sin(t * 7) * 0.12) - clamp(accel * 0.01, -0.3, 0.3)
      ant.current.rotation.z = -s.lean * 1.6
    }
    const beam = .6 + atmosphere.night * 3.4
    if (beamL.current) beamL.current.intensity = beam
    if (beamR.current) beamR.current.intensity = beam

    // ---------- publish ----------
    carState.drivingMode = reading ? 'Reading · Continue when ready' : frozen ? 'Paused' : driver.current.status
    carState.autopilotLaps = driver.current.laps
    carState.y = s.y
    carState.drifting = !frozen && sim.drifting
    carState.slip = sim.slip
    carState.grounded = sim.grounded
    carState.x = s.x
    carState.z = s.z
    carState.heading = s.heading
    carState.speed = reading ? 0 : s.speed
    carState.steer = s.steer
    updateEngine(frozen || reading ? 0 : speedN)

    // ---------- nearest zone ----------
    const stop = nearestExhibitStop(s.x, s.z, s.heading, st.currentStop)
    carState.nearDist = stop ? Math.hypot(s.x - stop.road[0], s.z - stop.road[1]) : Infinity
    st.setCurrentStop(stop?.id || null, stop?.zone.key || null)
    if (stop && !frozen) st.markVisited(stop.zone.key)

    // ---------- camera ----------
    s.camReady = Math.min(1, s.camReady + dt / 1.6)
    _fwd.set(Math.sin(s.heading), 0, Math.cos(s.heading))

    // idle orbit (restrained) when parked with nothing open
    const moving = Math.abs(s.speed) > 0.3 || thr || str
    s.idle = moving ? 0 : s.idle + dt
    const orbiting = !reduced && !frozen && !reading && s.idle > 3
    s.orbit = orbiting ? s.orbit + dt * 0.15 : damp(s.orbit, 0, 3, dt)

    const cardStop = selectVisibleStop(st)
    if (cardStop && (st.exhibitFocus || reading)) {
      const frame = worldCardFrame(cardStop, size.width, size.height)
      const [nx, nz] = frame.normal
      _look.set(...frame.center)
      _goal.set(frame.center[0] + nx * frame.distance + nz * .65, frame.center[1] + .65, frame.center[2] + nz * frame.distance - nx * .65)
    } else if (frozen && st.panelSource === 'world') {
      // lock-on: frame the vehicle against the zone it opened
      const zn = zoneLayout.find((z) => z.key === st.panel)
      if (zn) {
        _tmp.set(zn.pos[0] - s.x, 0, zn.pos[2] - s.z).normalize()
        _goal.set(s.x, 0, s.z).addScaledVector(_tmp, -7).addScaledVector(_fwd, 1)
        _goal.y = CAM_HEIGHT + 1.4
        _look.set((s.x + zn.pos[0]) / 2, 1.6, (s.z + zn.pos[2]) / 2)
      }
    } else if (frozen) {
      // opened from the menu — quiet 3/4 framing of the vehicle
      _goal.set(s.x - 7, CAM_HEIGHT + 1.5, s.z + 8)
      _look.set(s.x, 1.2, s.z)
    } else if (st.camMode === 'angled') {
      // Fixed world-space three-quarter direction; only the tracked position
      // moves with the car. Steering never orbits this camera.
      const roomy = size.width < 700 ? 1.2 : 1
      _goal.set(s.x + 9.1 * roomy, 1.5 + (17 * roomy - 1.5) * .7, s.z + 4.9 * roomy)
      _look.set(s.x, 1.5, s.z)
      if (cardStop && size.width < 700) {
        const shiftX = (cardStop.pos[0] - s.x) * .7
        const shiftZ = (cardStop.pos[2] - s.z) * .7
        _look.x += shiftX; _goal.x += shiftX
        _look.z += shiftZ; _goal.z += shiftZ
      }
    } else {
      const approach = clamp((14 - carState.nearDist) / 10, 0, 1)
      const mobilePreview = cardStop && size.width < 700
      const back = CAM_BACK + (reduced ? 0 : speedN * 3.2) - approach * 2.4 + (mobilePreview ? 5 : 0)
      const high = CAM_HEIGHT + approach * 0.6 + (mobilePreview ? 1 : 0)
      // behind-the-car vector, rotated by the idle-orbit angle
      const bx = -Math.sin(s.heading)
      const bz = -Math.cos(s.heading)
      const co = Math.cos(s.orbit)
      const so = Math.sin(s.orbit)
      _goal.set(
        s.x + (bx * co - bz * so) * back,
        high,
        s.z + (bx * so + bz * co) * back
      )
      if (!reduced) {
        _goal.x += Math.sin(t * 1.3) * speedN * 0.5
        _goal.y += Math.sin(t * 1.7) * speedN * 0.25
      }
      _look
        .set(s.x, 1.7, s.z)
        .addScaledVector(_fwd, 2.4 + speedN * 3) // look-ahead
      if (mobilePreview) {
        _look.x += (cardStop.pos[0] - s.x) * .85
        _look.z += (cardStop.pos[2] - s.z) * .85
        _look.y += .5
      }
    }

    if (!(cardStop && reading) && !st.exhibitFocus) {
      _goal.y += s.y - TRACK_SURFACE_Y
      _look.y += s.y - TRACK_SURFACE_Y
    }

    const scripted = !frozen && st.camMode !== 'follow'

    // clamp so the camera never dips into the ground or flies off the island
    _goal.y = Math.max(_goal.y, 2.6)
    if (!scripted) {
      const cr = Math.hypot(_goal.x, _goal.z)
      if (cr > 118) {
        _goal.x *= 118 / cr
        _goal.z *= 118 / cr
      }
    }

    const lambda = reduced ? 14 : frozen ? 4 : scripted ? 9 : 7
    // The intro camera orbits outside the island. Snap its first gameplay frame
    // to the chase rig so the transition can never travel through a tree crown.
    const enteringPlay = s.camReady < 0.08
    camera.position.x = enteringPlay ? _goal.x : damp(camera.position.x, _goal.x, lambda, dt)
    camera.position.y = enteringPlay ? _goal.y : damp(camera.position.y, _goal.y, lambda, dt)
    camera.position.z = enteringPlay ? _goal.z : damp(camera.position.z, _goal.z, lambda, dt)
    if (st.camMode === 'angled' && !frozen && !reading) {
      // Translate the look target with the damped camera too, keeping its
      // orientation constant even while catching up after a bend.
      camera.lookAt(camera.position.x - (_goal.x - _look.x), camera.position.y - (_goal.y - _look.y), camera.position.z - (_goal.z - _look.z))
    } else camera.lookAt(_look)

    const fovGoal = reduced || scripted ? CAM_FOV : CAM_FOV + speedN * 5
    camera.fov = damp(camera.fov, fovGoal, 5, dt)
    camera.updateProjectionMatrix()
  })

  const P = '#e8663f'

  return (
    <group
      ref={car}
      position={[CAR_SPAWN.x, TRACK_SURFACE_Y, CAR_SPAWN.z]}
      rotation={[0, CAR_SPAWN.heading, 0]}
      scale={KART_SCALE}
    >
      {/* Low undertray for the procedural fallback; the real kart supplies its own chassis. */}
      {!realKart && (
        <mesh castShadow position={[0, 0.38, 0]}>
          <boxGeometry args={[1.9, 0.28, 3.0]} />
          <meshStandardMaterial color="#3a3d47" roughness={0.7} />
        </mesh>
      )}

      <group ref={shell} position={[0, realKart ? 0.05 : 0.62, 0]}>
        {realKart ? (
          <>
            <KitPart kit="kart" fit={3.65} fitWidth rotation-y={Math.PI / 2} />
            {/* The model is one baked mesh, so these functional lights stay separate. */}
            {[-0.54, 0.54].map((x) => (
              <mesh key={x} position={[x, 0.48, 1.72]}>
                <sphereGeometry args={[0.095, 12, 10]} />
                <meshStandardMaterial
                  color="#fff6d8"
                  emissive="#ffd36b"
                  emissiveIntensity={2.2}
                  toneMapped={false}
                />
              </mesh>
            ))}
            <pointLight ref={beamL} position={[-0.5, 0.46, 1.9]} color="#ffe6a8" distance={10} intensity={0.6} />
            <pointLight ref={beamR} position={[0.5, 0.46, 1.9]} color="#ffe6a8" distance={10} intensity={0.6} />
          </>
        ) : (
          <>
        <RoundedBox args={[1.8, 0.62, 2.7]} radius={0.22} smoothness={4} castShadow>
          <meshStandardMaterial color={P} roughness={0.4} metalness={0.15} />
        </RoundedBox>
        {/* cabin */}
        <RoundedBox args={[1.28, 0.6, 1.15]} radius={0.14} smoothness={4} position={[0, 0.5, -0.15]} castShadow>
          <meshStandardMaterial color="#20242c" roughness={0.25} metalness={0.3} />
        </RoundedBox>
        <mesh position={[0, 0.52, 0.44]}>
          <boxGeometry args={[1.12, 0.42, 0.06]} />
          <meshStandardMaterial color="#bfe9ff" roughness={0.1} metalness={0.2} transparent opacity={0.65} />
        </mesh>
        {/* roll bar */}
        <mesh position={[0, 0.7, -0.7]} castShadow>
          <torusGeometry args={[0.58, 0.06, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#2a2d35" metalness={0.4} roughness={0.4} />
        </mesh>
        {/* eyes */}
        <group position={[0, 0.12, 1.36]}>
          {[-0.42, 0.42].map((x) => (
            <group key={x} position={[x, 0, 0]}>
              <mesh>
                <sphereGeometry args={[0.19, 14, 14]} />
                <meshStandardMaterial color="#fff" roughness={0.25} />
              </mesh>
              <mesh position={[0, 0, 0.13]}>
                <sphereGeometry args={[0.09, 10, 10]} />
                <meshStandardMaterial color="#1c1f26" />
              </mesh>
            </group>
          ))}
        </group>
        {/* headlights + glow */}
        {[-0.5, 0.5].map((x) => (
          <mesh key={x} position={[x, -0.16, 1.34]}>
            <sphereGeometry args={[0.12, 10, 10]} />
            <meshStandardMaterial color="#fff4c2" emissive="#ffdf7a" emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
        ))}
        <pointLight ref={beamL} position={[-0.5, -0.1, 1.9]} color="#ffe6a8" distance={9} intensity={0.6} />
        <pointLight ref={beamR} position={[0.5, -0.1, 1.9]} color="#ffe6a8" distance={9} intensity={0.6} />
        {/* spoiler */}
        <mesh position={[0, 0.2, -1.5]} castShadow>
          <boxGeometry args={[1.7, 0.09, 0.42]} />
          <meshStandardMaterial color={P} roughness={0.4} metalness={0.15} />
        </mesh>
        {[-0.6, 0.6].map((x) => (
          <mesh key={x} position={[x, 0.02, -1.42]} castShadow>
            <boxGeometry args={[0.1, 0.34, 0.1]} />
            <meshStandardMaterial color="#2a2d35" />
          </mesh>
        ))}
        {/* antenna */}
        <group ref={ant} position={[-0.74, 0.2, -1.2]}>
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1.1, 5]} />
            <meshStandardMaterial color="#2a2d35" />
          </mesh>
          <mesh position={[0, 1.12, 0]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial color="#ffd34d" emissive="#ff9500" emissiveIntensity={0.7} toneMapped={false} />
          </mesh>
        </group>
          </>
        )}
      </group>

      {!realKart && (
        <>
          <Wheel position={[-0.92, 0.44, 1.02]} front rollRef={fl} steerRef={sfl} />
          <Wheel position={[0.92, 0.44, 1.02]} front rollRef={fr} steerRef={sfr} />
          <Wheel position={[-0.92, 0.44, -1.05]} rollRef={rl} />
          <Wheel position={[0.92, 0.44, -1.05]} rollRef={rr} />
        </>
      )}
    </group>
  )
}
