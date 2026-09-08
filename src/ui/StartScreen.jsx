import { useStore } from '../state/store.js'
import { initSound, setSoundEnabled } from '../lib/sound.js'

export default function StartScreen() {
  const begin = (autopilot) => {
    const state = useStore.getState()
    initSound(); setSoundEnabled(state.soundOn)
    state.setAutopilot(autopilot); state.setResumeFollowing(true); state.start()
  }
  return (
    <div className="career-tour-start">
      <h2>Take a lap<br />through my work.</h2>
      <span>Explore nine trackside displays. The tour pulls up to each 3D card and waits while you read.</span>
      <button onClick={() => begin(true)}>Start guided tour →</button>
      <button className="tour-manual" onClick={() => begin(false)}>Drive yourself</button>
    </div>
  )
}
