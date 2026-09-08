import { useStore } from '../state/store.js'
import { zoneByKey } from '../game/zones.js'
export default function InteractionHint() {
  const current = useStore(s => s.current)
  const dismissed = useStore(s => s.cardsDismissed)
  const menu = useStore(s => s.menuOpen)
  if (!current || menu || !dismissed) return null
  return <div className="resume-road-hint"><span>{zoneByKey[current].label}</span><button onClick={() => useStore.getState().focusExhibit(current)}>Read closer <kbd>E</kbd></button></div>
}
