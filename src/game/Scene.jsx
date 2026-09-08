import { Component, Suspense } from 'react'
import Lighting from './Lighting.jsx'
import Sky from './env/Sky.jsx'
import RaceTrack from './RaceTrack.jsx'
import Zones from './Zones.jsx'
import ConnectPad from './ConnectPad.jsx'
import Car from './Car.jsx'
import Effects from './Effects.jsx'
import SkidMarks from './SkidMarks.jsx'
import DriftPuffs from './DriftPuffs.jsx'

class TrackBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

export default function Scene() {
  return (
    <>
      <fog attach="fog" args={['#e1c4a6', 120, 360]} />
      <Lighting />
      <Sky />
      {/* Keep the playable scene visible while the optional 10 MB course loads. */}
      <TrackBoundary>
        <Suspense fallback={null}>
          <RaceTrack />
        </Suspense>
      </TrackBoundary>
      <Zones />
      <ConnectPad />
      <Car />
      <DriftPuffs />
      <SkidMarks />
      <Effects />
    </>
  )
}
