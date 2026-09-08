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
      <p>Explore the career circuit</p>
      <h2>Take a lap<br />through my work.</h2>
      <span>Nine spaced-out stops, one card at a time. The guided tour waits while you read. Choose Continue on the 3D card when you’re ready.</span>
      <button onClick={() => begin(true)}>Start guided tour →</button>
      <button className="tour-manual" onClick={() => begin(false)}>Drive yourself · WASD / arrows</button>
    </div>
  )
}
