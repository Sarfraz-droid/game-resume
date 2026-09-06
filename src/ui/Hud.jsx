import TopBar from './TopBar.jsx'
import Menu from './Menu.jsx'
import Minimap from './Minimap.jsx'
import CameraControl from './CameraControl.jsx'
import InteractionHint from './InteractionHint.jsx'
import TouchControls from './TouchControls.jsx'
import Panel from './Panel.jsx'
import { useStore } from '../state/store.js'

export default function Hud() {
  const phase = useStore((s) => s.phase)
  const playing = phase === 'playing'
  return (
    <div className="hud">
      <TopBar />
      <Menu />
      {playing && (
        <>
          <Minimap />
          <CameraControl />
          <InteractionHint />
          <TouchControls />
        </>
      )}
      <Panel />
    </div>
  )
}
