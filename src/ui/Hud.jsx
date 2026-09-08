import { selectReadingPause } from '../state/store.js'
import DrivingControls from './DrivingControls.jsx'
import DrivingStatus from './DrivingStatus.jsx'
import TopBar from './TopBar.jsx'
import Menu from './Menu.jsx'
import Minimap from './Minimap.jsx'
import CameraControl from './CameraControl.jsx'
import InteractionHint from './InteractionHint.jsx'
import TouchControls from './TouchControls.jsx'
import { useStore } from '../state/store.js'

export default function Hud() {
  const phase = useStore((s) => s.phase)
  const focused = useStore(s => !!s.exhibitFocus || selectReadingPause(s))
  const menuOpen = useStore(s => s.menuOpen)
  const playing = phase === 'playing'
  return (
    <div className="hud">
      <TopBar />
      <Menu />
      {playing && (
        <>
          {!focused && !menuOpen && <Minimap />}
          {!focused && !menuOpen && <><DrivingStatus /><DrivingControls /></>}
          {!focused && !menuOpen && <CameraControl />}
          <InteractionHint />
          {!focused && <TouchControls />}
        </>
      )}

    </div>
  )
}
